import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isEqual, uniq } from 'lodash';
import { resolveObject } from './utils/componentUtils.js';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const schemaPath = path.slice(0, path.length - 1);
  const parentSchema = resolveObject(oas, schemaPath);

  // Ignore base types, see IPA125OneOfNoBaseTypes.js
  if (input.some((oneOfOption) => oneOfOption.type !== 'object')) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, schemaPath);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, parentSchema, schemaPath);
};

function checkViolationsAndReturnErrors(schemas, path) {
  if (schemas.length > 1) {
    const uniquePropertyKeys = getUniquePropertyKeys(schemas);

    const propertiesAcrossMultipleOneOf = [];
    uniquePropertyKeys.forEach((property) => {
      const propertySchemas = [];
      schemas.forEach(
        (schema) => schema['properties'][property] && propertySchemas.push(schema['properties'][property])
      );

      if (propertySchemas.length > 1) {
        propertiesAcrossMultipleOneOf.push({
          propertyKey: property,
          propertySchemas: propertySchemas,
        });
      }
    });

    const errors = [];
    propertiesAcrossMultipleOneOf.forEach(({ propertyKey, propertySchemas }) => {
      // Check schemas for properties of the same name have the same type/schema
      if (!hasSameType(propertySchemas)) {
        errors.push({
          path,
          message: `Property '${propertyKey}' has different types or schemas in oneOf items.`,
        });
      }
    });
    return errors;
  }
  return [];
}

/**
 * Takes a list of schemas and returns all property keys present in the schemas. The list has no duplicates.
 * @param {[{}]} schemas all schemas to evaluate
 * @returns {string[]} a list of property keys present in the schemas without duplicates
 */
function getUniquePropertyKeys(schemas) {
  const properties = [];
  schemas.forEach((schema) => properties.push(...Object.keys(schema.properties)));
  return uniq(properties);
}

/**
 * Validates that all schemas in the list have the same base type, or the same schema in case of 'object' type
 * @param {[{}]} propertySchemas all schemas to evaluate
 * @returns {boolean} true if the schemas have the same type or schema
 */
function hasSameType(propertySchemas) {
  // Validate properties of type 'object'
  if (propertySchemas[0]['type'] === 'object' && !propertySchemas[0]['oneOf']) {
    if (allPropsAreObjects(propertySchemas)) {
      // Check all property schemas are equal
      return propertySchemas.every(
        (prop) => isEqual(prop, propertySchemas[0]) || oneOfTypeIsEqual(prop, propertySchemas[0])
      );
    }
    return false;
  }

  // Validate properties of base type
  const expectedType = propertySchemas[0]['oneOf']
    ? propertySchemas[0]['oneOf'][0]['type']
    : propertySchemas[0]['type'];
  return propertySchemas.every((prop) => prop['type'] === expectedType || oneOfBaseTypeIsEqual(prop, expectedType));
}

function allPropsAreObjects(propertySchemas) {
  return propertySchemas.every((prop) => prop['type'] === 'object');
}

function oneOfBaseTypeIsEqual(prop, expectedType) {
  return prop['oneOf'] && prop['oneOf'][0].type === expectedType;
}

function oneOfTypeIsEqual(prop, expectedSchema) {
  return prop['oneOf'] && isEqual(prop['oneOf'][0], expectedSchema);
}
