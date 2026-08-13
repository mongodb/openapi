import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isOperationsPath, isRootLevelOperationsPath } from './utils/longRunningOperations.js';

const ERROR_MESSAGE =
  'Operations endpoints must not be standalone, global endpoints with no parent resource in their path.';

/**
 * Checks that an Operations endpoint defined by IPA-132 is not a standalone, global endpoint,
 * rejecting Operations endpoints mounted at the API root such as `/api/atlas/v2/operations`.
 *
 * The existing `resourceBelongsToSingleParent` util is not reusable here: it requires the
 * grandparent segment to be a path parameter, which rejects the collection-scoped Operations
 * form `/parent/operations` that IPA-132 explicitly allows.
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

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, oas.paths[input], path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    if (isRootLevelOperationsPath(input)) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
