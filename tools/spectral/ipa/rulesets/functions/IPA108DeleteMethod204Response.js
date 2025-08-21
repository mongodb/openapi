import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isSingleResourceIdentifier } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'DELETE method should return 204 No Content status code.';

/**
 * Delete method should return 204 No Content status code
 *
 * @param {object} input - The delete operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  // Check if the path is for a single resource (e.g., has path parameter)
  // Extract the path from context.path which is an array
  const pathString = path[1]; // Assuming path is ['paths', '/resource/{id}', 'delete']
  if (!isSingleResourceIdentifier(pathString)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    const responses = input.responses;
    // If there is no 204 response, return a violation
    if (!responses || !responses['204']) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    // If there are other 2xx responses that are not 204, return a violation
    if (Object.keys(responses).some((key) => key.startsWith('2') && key !== '204')) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
