import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-108-delete-include-404-response';
const ERROR_MESSAGE = 'DELETE method should include 404 status code for not found resources.';

/**
 * Delete method should include 404 status code for not found resources
 *
 * @param {object} input - The delete operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path }) => {
  const responses = input.responses;
  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  if (!responses || !responses['404']) {
    return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
  }
  return collectAdoption(path, RULE_NAME);
};
