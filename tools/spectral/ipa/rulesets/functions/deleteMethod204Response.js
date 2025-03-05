import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-108-delete-method-return-204-response';
const ERROR_MESSAGE = 'DELETE method should return 204 No Content status code';

/**
 * Delete method should return 204 No Content status code
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

  const responses = deleteOp.responses || {};
  if (!responses['204']) {
    return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
  }

  collectAdoption(path, RULE_NAME);
};
