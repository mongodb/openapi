import { handleInternalError } from '../collectionUtils.js';

/**
 * Common validation function for checking that responses have the expected status code.
 * Returns errors in case of violations, ready to be used in a custom validation function.
 *
 * @param {Object} operationObject the operation object to evaluate
 * @param {string} expectedStatusCode the expected status code to validate for
 * @param {string[]} path the path to the operation object being evaluated
 * @param {string} ruleName the rule name
 * @param errorMessage the error message
 * @returns {*[]|[{path, message}]} the errors found, or an empty array in case of no errors
 */
export function checkResponseCodeAndReturnErrors(operationObject, expectedStatusCode, path, ruleName, errorMessage) {
  try {
    const responses = operationObject.responses;
    // If the expected status code is not present, return a violation
    if (!responses || !responses[expectedStatusCode]) {
      return [{ path, message: errorMessage }];
    }

    // If there are other responses within the same status code group (hundreds), return a violation
    if (
      Object.keys(responses).some((key) => key.startsWith(expectedStatusCode.charAt(0)) && key !== expectedStatusCode)
    ) {
      return [{ path, message: errorMessage }];
    }
    return [];
  } catch (e) {
    handleInternalError(ruleName, path, e);
  }
}
