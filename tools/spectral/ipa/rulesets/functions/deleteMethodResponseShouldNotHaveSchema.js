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

  if (hasException(deleteOp, RULE_NAME)) {
    collectException(deleteOp, RULE_NAME, path);
    return;
  }

  const responses = deleteOp.responses || {};
  for (const [status, response] of Object.entries(responses)) {
    if (status === '204' && response.content) {
      for (const contentType of Object.keys(response.content)) {
        if (response.content[contentType].schema) {
          return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
        }
      }
    }
  }

  collectAdoption(path, RULE_NAME);
};
