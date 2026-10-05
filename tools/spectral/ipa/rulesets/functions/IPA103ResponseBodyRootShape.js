import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const ERROR_MESSAGE =
  'Response bodies must be a JSON object with named properties, or a oneOf whose variants are all objects.';

/**
 * Response body root shape check for IPA-103.
 *
 * The rule verifies that every JSON response body resolves to an object with named properties, or a
 * `oneOf` whose variants are all objects. It rejects arrays, primitive types and objects whose only
 * keys are `additionalProperties`.
 *
 * @param {string} input the response content media type (from `field: '@key'`)
 * @param _ unused options
 * @param {object} context the context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const contentPerMediaType = resolveObject(oas, path);

  // Only applies to JSON response bodies that define a schema
  if (!input.endsWith('json') || !contentPerMediaType || !contentPerMediaType.schema) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(contentPerMediaType.schema, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, contentPerMediaType, path);
};

function checkViolationsAndReturnErrors(schema, path, ruleName) {
  try {
    if (isValidRootShape(schema)) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}

function isValidRootShape(schema) {
  // A discriminated oneOf whose variants are all objects
  if (Array.isArray(schema.oneOf)) {
    return schema.oneOf.length > 0 && schema.oneOf.every((variant) => variant && variant.type === 'object');
  }
  // A JSON object with a fixed set of named properties. This rejects type: array, primitive types,
  // and objects whose only keys are additionalProperties.
  return schema.type === 'object' && schema.properties !== undefined && Object.keys(schema.properties).length > 0;
}
