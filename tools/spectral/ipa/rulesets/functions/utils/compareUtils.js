// utils/compareUtils.js

/**
 * Deep schema structure equality check between two values
 * Compares property names and types, but not specific values
 * Does not handle circular references
 * @param {object} object1 First schema to compare
 * @param {object} object2 Second schema to compare
 * @returns {boolean} Whether the schemas have identical structure
 */
export function isDeepEqual(object1, object2) {
  if (object1 === object2) {
    return true;
  }

  if (typeof object1 !== 'object' || typeof object2 !== 'object') {
    return typeof object1 === typeof object2;
  }

  if (object1.properties && object2.properties) {
    const propKeys1 = Object.keys(object1.properties);
    const propKeys2 = Object.keys(object2.properties);

    if (propKeys1.length !== propKeys2.length) return false;

    for (const key of propKeys1) {
      if (!propKeys2.includes(key)) return false;

      // Check if the types match for each property
      if (object1.properties[key].type !== object2.properties[key].type) {
        return false;
      }

      // Recursively check nested objects
      if (typeof object1.properties[key] === 'object' && typeof object2.properties[key] === 'object') {
        if (!isDeepEqual(object1.properties[key], object2.properties[key])) {
          return false;
        }
      }
    }
  }

  if (object1.type !== object2.type) return false;

  const getRelevantKeys = (obj) => {
    return Object.keys(obj).filter((key) => {
      const polymorphismProps = ['allOf', 'anyOf', 'oneOf', 'discriminator'];
      return polymorphismProps.includes(key);
    });
  };
  const keys1 = getRelevantKeys(object1);
  const keys2 = getRelevantKeys(object2);
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;

    if (
      typeof object1[key] === 'object' &&
      object1[key] !== null &&
      typeof object2[key] === 'object' &&
      object2[key] !== null
    ) {
      if (!isDeepEqual(object1[key], object2[key])) return false;
    } else if (object1.type !== object2.type) {
      return false;
    }
  }

  return true;
}

/**
 * Recursively removes properties with given flags from schema
 * @param {object} schema The schema to process
 * @param {string} propertyToRemove The property type to remove (boolean property)
 * @returns {object} New schema with specified properties removed
 */
export function removePropertiesByFlag(schema, propertyToRemove) {
  if (!schema || typeof schema !== 'object') return schema;

  const result = {};

  // Handle regular object properties
  for (const [key, value] of Object.entries(schema)) {
    // Skip this property if it's marked with the flag we're removing
    if (key === propertyToRemove && value === true) continue;

    // Handle properties object specially
    if (key === 'properties' && typeof value === 'object') {
      result[key] = {};
      for (const [propName, propValue] of Object.entries(value)) {
        // Skip properties marked with the flag we're removing
        if (propValue[propertyToRemove] === true) continue;
        result[key][propName] = removePropertiesByFlag(propValue, propertyToRemove);
      }
    } else if (typeof value === 'object') {
      result[key] = removePropertiesByFlag(value, propertyToRemove);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Recursively removes specific property keys from schema
 * @param {object} schema The schema to process
 * @param {...string} propertyNames Property names to remove
 * @returns {object} New schema with specified property keys removed
 */
export function removePropertyKeys(schema, ...propertyNames) {
  if (!schema || typeof schema !== 'object') return schema;

  const result = {};

  // Handle regular object properties
  for (const [key, value] of Object.entries(schema)) {
    // Skip this property if it's in the list of properties to remove
    if (propertyNames.includes(key)) continue;

    if (typeof value === 'object') {
      result[key] = removePropertyKeys(value, ...propertyNames);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Recursively removes properties for Response schemas
 * @param {object} schema The schema to process
 * @returns {object} New schema with readOnly properties removed
 */
export function removeResponseProperties(schema) {
  let result = removePropertiesByFlag(schema, 'readOnly');
  return removePropertyKeys(result, 'title', 'description', 'required');
}

/**
 * Recursively removes properties for Request schemas
 * @param {object} schema The schema to process
 * @returns {object} New schema with writeOnly properties removed
 */
export function removeRequestProperties(schema) {
  let result = removePropertiesByFlag(schema, 'writeOnly');
  return removePropertyKeys(result, 'title', 'description', 'required');
}
