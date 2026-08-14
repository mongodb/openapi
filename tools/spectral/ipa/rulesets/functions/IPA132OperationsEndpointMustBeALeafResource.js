import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { containsOperationsSegment, operationsSegmentIsLeaf } from './utils/longRunningOperations.js';

const ERROR_MESSAGE =
  'Operations endpoints must be leaf resources. An `operations` segment may only be followed by a single operation identifier path parameter.';

/**
 * Checks that an Operations resource defined by IPA-132 is a leaf resource, i.e. nothing is nested
 * below the first `operations` segment other than a single `{operationId}` path parameter.
 *
 * @param {string} input - The path key from the OpenAPI spec
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  if (!containsOperationsSegment(input)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, oas.paths[input], path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    if (!operationsSegmentIsLeaf(input)) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
