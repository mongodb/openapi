import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isCompliantLongRunningOperation } from './utils/longRunningOperations.js';

const MISSING_LOCATION_ERROR_MESSAGE =
  'The 202 Accepted response must include a Location header pointing at the Operation resource URI.';

/**
 * Checks that a method starting a long-running operation defined by IPA-132 returns 202 Accepted
 * with a Location header pointing at the Operation resource URI.
 *
 * @param {object} input - The operation object of a mutating method
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;

  if (!isCompliantLongRunningOperation(input)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(operation, path, ruleName) {
  try {
    const headers = operation.responses['202'].headers;
    // HTTP header names are case-insensitive
    const hasLocationHeader = headers && Object.keys(headers).some((header) => header.toLowerCase() === 'location');
    if (!hasLocationHeader) {
      return [{ path: [...path, 'responses', '202'], message: MISSING_LOCATION_ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
