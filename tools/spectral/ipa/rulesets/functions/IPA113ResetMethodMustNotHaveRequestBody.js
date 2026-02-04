import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isResetMethod } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'The :reset custom method must not have a request body.';

/**
 * Reset method should not have a request body
 *
 * @param {object} input - The reset operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  const pathString = path[1]; // e.g., ['paths', '/resource/{id}/singleton:reset', 'post']

  if (!isResetMethod(pathString)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    if (input.requestBody) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
