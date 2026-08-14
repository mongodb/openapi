import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getResourcePathItems, isReadOnlyResource } from './utils/resourceEvaluation.js';
import { isOperationsCollectionPath, isOperationsPath } from './utils/longRunningOperations.js';

const READ_ONLY_SCHEMA_ERROR_MESSAGE =
  'The Operation resource must be read-only. All properties of the GET response schema must be marked as readOnly: true.';

/**
 * Checks that an Operations endpoint defined by IPA-132 is a read-only resource: its path items
 * define no mutating HTTP methods, and all properties of the Operation resource are readOnly.
 *
 * @param {string} input - The path key from the OpenAPI spec
 * @param {{forbiddenMethods: string[]}} options - The methods an Operations endpoint must not define
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, { forbiddenMethods }, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  if (!isOperationsPath(input)) {
    return;
  }

  const pathItem = oas.paths[input];
  const errors = checkViolationsAndReturnErrors(input, pathItem, oas, forbiddenMethods, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, pathItem, path);
};

function checkViolationsAndReturnErrors(input, pathItem, oas, forbiddenMethods, path, ruleName) {
  try {
    const errors = [];
    for (const method of forbiddenMethods) {
      // Key presence, not truthiness - a declared method with a null/empty value still advertises the route
      if (method in pathItem) {
        errors.push({
          path: [...path, method],
          message: `Operations endpoints are read-only and do not allow the ${method} method.`,
        });
      }
    }

    // The readOnly schema condition applies to the resource as a whole, so it is evaluated once
    // per Operations resource, on its collection path item
    if (isOperationsCollectionPath(input) && !isReadOnlyResource(getResourcePathItems(input, oas.paths))) {
      errors.push({ path, message: READ_ONLY_SCHEMA_ERROR_MESSAGE });
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
