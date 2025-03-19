import { collectAdoption, collectAndReturnViolation } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-125-oneOf-must-have-discriminator';
const ERROR_MESSAGE = 'Each oneOf property must include a discriminator property to define the exact type.';
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

  // Validate the presence of a discriminator
  if (!schema.discriminator || typeof schema.discriminator !== 'object' || !schema.discriminator.propertyName) {
    return collectAndReturnViolation(path, RULE_NAME, [{ message: ERROR_MESSAGE }]);
  }

  if (!schema.discriminator.mapping) {
    return collectAndReturnViolation(path, RULE_NAME, [{ message: ERROR_MESSAGE }]);
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
