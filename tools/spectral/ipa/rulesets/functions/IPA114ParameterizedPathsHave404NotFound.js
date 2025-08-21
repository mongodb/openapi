import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE = `Parameterized path must define a 404 response.`;
/**
 * Validates that paths with parameters include a 404 response
 *
 * @param {object} input - The operation object to check
 * @param {object} _ - Rule options (unused)
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  // Path components: [paths, pathName, methodName, ...]
  const pathName = path[1];

  const pathParamRegex = /{[^{}]+}/;
  if (!pathParamRegex.test(pathName)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input.responses, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

/**
 * Check for violations in response structure
 *
 * @param {object} responses - The responses object to validate
 * @param {Array} path - Path to the responses in the document
 * @param ruleName the name of the Spectral rule under validation
 * @returns {Array} - Array of error objects
 */
function checkViolationsAndReturnErrors(responses, path, ruleName) {
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
    return handleInternalError(ruleName, path, e);
  }
}
