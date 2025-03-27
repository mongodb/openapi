import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-117-plaintext-response-must-have-example';
const ERROR_MESSAGE = 'For APIs that respond with plain text, for example CSV, API producers must provide an example.';

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

  if (hasException(response, RULE_NAME)) {
    collectException(response, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(response, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(response, path) {
  try {
    if (response['example'] || (response['schema'] && response['schema']['example'])) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
