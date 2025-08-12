import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isSingleResourceIdentifier } from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-108-delete-request-no-body';
const ERROR_MESSAGE = 'DELETE method should not have a request body.';

/**
 * Delete method should not have a request body
 *
 * @param {object} input - The delete operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path }) => {
  // Check if the path is for a single resource (e.g., has path parameter)
  // Extract the path from context.path which is an array
  const pathString = path[1]; // Assuming path is ['paths', '/resource/{id}', 'delete']
  if (!isSingleResourceIdentifier(pathString)) {
    return;
  }

  let errors = [];
  if (input.requestBody) {
    errors = [
      {
        path,
        message: ERROR_MESSAGE,
      },
    ];
  }
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};
