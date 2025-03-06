import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-108-delete-response-should-be-empty';
const ERROR_MESSAGE =
  'DELETE method should return an empty response. The response should not have a schema property and reference to models.';

/**
 * Delete method should return an empty response
 * @param {object} input - The delete operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path }) => {
  const deleteOp = input;
  if (!deleteOp.responses || deleteOp.responses.length === 0) {
    return;
  }
  if (hasException(deleteOp, RULE_NAME)) {
    collectException(deleteOp, RULE_NAME, path);
    return;
  }

  const responses = deleteOp.responses;
  if (responses && responses['204']) {
    const successResponse = responses['204'];
    if (successResponse.content) {
      for (const contentType of Object.keys(successResponse.content)) {
        // Check if the response has a schema property
        if (successResponse.content[contentType] && successResponse.content[contentType].schema) {
          return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
        }
      }
    }
    collectAdoption(path, RULE_NAME);
  }
};
