import { collectAdoption, collectAndReturnViolation } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-125-oneOf-must-have-discriminator';
const MISSING_DISCRIMINATOR_MESSAGE = 'The schema has oneOf but no discriminator property.';
const INVALID_DISCRIMINATOR_MESSAGE = 'Discriminator property is not an object.';
const MISSING_PROPERTY_NAME_MESSAGE = 'Discriminator has no propertyName defined.';
const MISSING_MAPPING_MESSAGE = 'Discriminator must have a mapping object.';
const MAPPING_ERROR_MESSAGE =
  'The discriminator mapping must match the oneOf references. Unmatched Discriminator mappings with oneOf references:';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved; // Use unresolved document to access raw $ref
  const schema = resolveObject(oas, path);

  if (!schema || !schema.oneOf || !Array.isArray(schema.oneOf)) {
    return;
  }

  // Check for exception first
  if (hasException(schema, RULE_NAME)) {
    return;
  }

  // Check if all oneOf items are objects with a $ref property
  const allReferences = schema.oneOf.every((item) => typeof item === 'object' && item.$ref);
  if (!allReferences) {
    return;
  }

  // Validate the presence of a discriminator with more specific error messages
  if (!schema.discriminator) {
    return collectAndReturnViolation(path, RULE_NAME, [{ message: MISSING_DISCRIMINATOR_MESSAGE }]);
  }

  if (typeof schema.discriminator !== 'object') {
    return collectAndReturnViolation(path, RULE_NAME, [{ message: INVALID_DISCRIMINATOR_MESSAGE }]);
  }

  if (!schema.discriminator.propertyName) {
    return collectAndReturnViolation(path, RULE_NAME, [{ message: MISSING_PROPERTY_NAME_MESSAGE }]);
  }

  if (!schema.discriminator.mapping) {
    return collectAndReturnViolation(path, RULE_NAME, [{ message: MISSING_MAPPING_MESSAGE }]);
  }

  const oneOfRefs = schema.oneOf.map((item) => item.$ref);
  const mappingValues = Object.values(schema.discriminator.mapping);

  // Check for discriminator mappings that don't match any oneOf reference
  const unmatchedMappings = mappingValues.filter((mapping) => !oneOfRefs.includes(mapping));
  if (unmatchedMappings.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, [
      { message: `${MAPPING_ERROR_MESSAGE} ${unmatchedMappings.join(', ')}` },
    ]);
  }

  collectAdoption(path, RULE_NAME);
};
