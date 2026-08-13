import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isOperationsPath } from './utils/longRunningOperations.js';

const FORBIDDEN_METHODS = ['post', 'put', 'patch', 'delete'];

/**
 * Checks that an Operations endpoint defined by IPA-132 is a read-only resource, i.e. its path
 * items define no mutating HTTP methods.
 *
 * @param {string} input - The path key from the OpenAPI spec
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  if (!isOperationsPath(input)) {
    return;
  }

  const pathItem = oas.paths[input];
  const errors = checkViolationsAndReturnErrors(pathItem, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, pathItem, path);
};

function checkViolationsAndReturnErrors(pathItem, path, ruleName) {
  try {
    const errors = [];
    for (const method of FORBIDDEN_METHODS) {
      // Key presence, not truthiness - a declared method with a null/empty value still advertises the route
      if (method in pathItem) {
        errors.push({
          path: [...path, method],
          message: `Operations endpoints are read-only and do not allow the ${method} method.`,
        });
      }
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
