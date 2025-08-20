import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-117-plaintext-response-must-have-example';
const ERROR_MESSAGE = 'For APIs that respond with plain text, for example CSV, API producers must provide an example.';

/**
 * For APIs that respond with plain text, for example CSV, API producers must provide an example.
 *
 * @param {object} input - A response media type
 * @param {{allowedTypes: string[]}} opts - Allowed type suffixes, if the type ends with one of these, it is ignored
 * @param {object} context - The context object containing the path and documentInventory
 */
export default (input, { allowedTypes }, { documentInventory, path }) => {
  const responseCode = path[4];

  // Ignore non-2xx responses
  if (!responseCode.startsWith('2')) {
    return;
  }

  // Ignore allowed types
  if (allowedTypes.some((type) => input.endsWith(type))) {
    return;
  }

  const response = resolveObject(documentInventory.resolved, path);

  // Ignore binary formats, i.e. files
  if (
    (response['type'] && response['format'] === 'binary') ||
    (response['schema'] && response['schema']['format'] === 'binary')
  ) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(response, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, response, path);
};

function checkViolationsAndReturnErrors(response, path) {
  try {
    if (response['example'] || (response['schema'] && response['schema']['example'])) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
