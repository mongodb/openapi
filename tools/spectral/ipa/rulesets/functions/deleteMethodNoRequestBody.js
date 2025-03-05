import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-108-delete-request-no-body';
const ERROR_MESSAGE = 'DELETE method should not have a request body';

/**
 * Delete method should not have a request body
 *
 * @param {object} input - The delete operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path }) => {
  const deleteOp = input;
  if (!deleteOp) return;

  if (hasException(deleteOp, RULE_NAME)) {
    collectException(deleteOp, RULE_NAME, path);
    return;
  }

  if (deleteOp.requestBody) {
    return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
  }

  collectAdoption(path, RULE_NAME);
};
