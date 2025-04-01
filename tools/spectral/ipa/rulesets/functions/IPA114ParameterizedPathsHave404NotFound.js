import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-114-parameterized-paths-have-404-not-found';
const ERROR_MESSAGE = `Parameterized path must define a 404 response.`;
/**
 * Validates that paths with parameters include a 404 response
 *
 * @param {object} input - The operation object to check
 * @param {object} _ - Rule options (unused)
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path }) => {
  // Path components: [paths, pathName, methodName, ...]
  const pathName = path[1];

  const pathParamRegex = /{[^{}]+}/;
  if (!pathParamRegex.test(pathName)) {
    return;
  }

  // Check for exception at operation level
  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input.responses, path);
  if (errors.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

/**
 * Check for violations in response structure
 *
 * @param {object} responses - The responses object to validate
 * @param {Array} path - Path to the responses in the document
 * @returns {Array} - Array of error objects
 */
function checkViolationsAndReturnErrors(responses, path) {
  try {
    if (!responses) {
      return [
        {
          path,
          message: ERROR_MESSAGE,
        },
      ];
    }

    // Check for 404 Not Found response
    if (!responses['404']) {
      return [
        {
          path,
          message: ERROR_MESSAGE,
        },
      ];
    }

    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
