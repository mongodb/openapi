import {
  evaluateAndCollectAdoptionStatus,
  evaluateAndCollectAdoptionStatusWithInheritedException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { findExceptionInParentSchema } from './utils/exceptions.js';

const IS_PREFIX_REGEX = /^is[A-Z]/;

/**
 * Checks that boolean field names do not use the "is" prefix
 *
 * The exception can be set on the field or on the schema containing the field. An exception on the schema applies to all of its fields.
 *
 * @param {string} input - The field name
 * @param {object} options - Rule configuration options
 * @param {object} context - The context object containing the path and documentInventory
 */
export default (input, options, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref) and non-boolean fields:
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property || property.type !== 'boolean') {
    return;
  }

  const result = findExceptionInParentSchema(oas, property, path, ruleName);
  if (result?.error) {
    return result.error;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  if (result) {
    return evaluateAndCollectAdoptionStatusWithInheritedException(errors, ruleName, result.schema, path);
  }
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    if (IS_PREFIX_REGEX.test(input)) {
      const suggestedName = input.charAt(2).toLowerCase() + input.slice(3);
      const errorMessage = `Boolean field "${input}" should not use the "is" prefix. Use "${suggestedName}" instead.`;
      return [{ path, message: errorMessage }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
