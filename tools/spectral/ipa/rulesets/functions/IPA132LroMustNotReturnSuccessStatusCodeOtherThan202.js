import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isCompliantLongRunningOperation } from './utils/longRunningOperations.js';

/**
 * Checks that a method starting a long-running operation defined by IPA-132 does not advertise
 * any success status code other than 202 Accepted.
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
    const responses = operation.responses;
    if (!responses) {
      return [];
    }

    const errors = [];
    for (const responseCode of Object.keys(responses)) {
      if (responseCode.startsWith('2') && responseCode !== '202') {
        errors.push({
          path: [...path, 'responses', responseCode],
          message: `The long-running operation must not return the ${responseCode} success status code. 202 Accepted is the only success response of a long-running operation.`,
        });
      }
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
