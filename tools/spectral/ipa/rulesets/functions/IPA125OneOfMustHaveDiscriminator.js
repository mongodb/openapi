import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const MISSING_DISCRIMINATOR_MESSAGE = 'The schema has oneOf but no discriminator property.';
const INVALID_DISCRIMINATOR_MESSAGE = 'Discriminator property is not an object.';
const MISSING_PROPERTY_NAME_MESSAGE = 'Discriminator has no propertyName defined.';
const MISSING_MAPPING_MESSAGE = 'Discriminator must have a mapping object.';
const MAPPING_ERROR_MESSAGE =
  'The discriminator mapping must match the oneOf references. Unmatched Discriminator mappings with oneOf references:';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  if (!input.oneOf) {
    return;
  }
  const schema = resolveObject(documentInventory.unresolved, path);

  const errors = checkViolationsAndReturnErrors(schema, path);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, schema, path);
};

function checkViolationsAndReturnErrors(schema, path) {
  // Check if all oneOf items are objects with a $ref property
  const allReferences = schema.oneOf.every((item) => typeof item === 'object' && item.$ref);
  if (!allReferences) {
    return [];
  }

  // Validate the presence of a discriminator with more specific error messages
  if (!schema.discriminator) {
    return [{ path, message: MISSING_DISCRIMINATOR_MESSAGE }];
  }

  if (typeof schema.discriminator !== 'object') {
    return [{ path, message: INVALID_DISCRIMINATOR_MESSAGE }];
  }

  if (!schema.discriminator.propertyName) {
    return [{ path, message: MISSING_PROPERTY_NAME_MESSAGE }];
  }

  if (!schema.discriminator.mapping) {
    return [{ path, message: MISSING_MAPPING_MESSAGE }];
  }

  // Get the $ref values from the unresolved document
  const oneOfRefs = schema.oneOf.map((item) => item.$ref);
  const mappingValues = Object.values(schema.discriminator.mapping);

  // Check for discriminator mappings that don't match any oneOf reference
  const unmatchedMappings = mappingValues.filter((mapping) => !oneOfRefs.includes(mapping));
  if (unmatchedMappings.length > 0) {
    return [
      {
        path,
        message: `${MAPPING_ERROR_MESSAGE} ${unmatchedMappings.join(', ')}`,
      },
    ];
  }
  return [];
}
