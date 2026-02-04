import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isResetMethod } from './utils/resourceEvaluation.js';
import { checkResponseCodeAndReturnErrors } from './utils/validations/checkResponseCodeAndReturnErrors.js';

const ERROR_MESSAGE =
  'The :reset custom method must return a 200 OK response with the reset resource in the response body. This method either lacks a 200 OK response or defines a different 2xx status code.';

/**
 * Reset method must return 200 OK response code with response body
 *
 * @param {object} input - The reset operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  const pathString = path[1];

  if (!isResetMethod(pathString)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    // First check if 200 OK response exists
    const responseCodeErrors = checkResponseCodeAndReturnErrors(input, '200', path, ruleName, ERROR_MESSAGE);
    if (responseCodeErrors.length > 0) {
      return responseCodeErrors;
    }

    // Check if the 200 response has a response body with schema
    const response200 = input.responses['200'];
    if (!response200 || !response200.content) {
      return [
        {
          path,
          message:
            'The :reset custom method must return a 200 OK response with the reset resource in the response body.',
        },
      ];
    }

    // Verify that at least one content type has a schema
    const contentTypes = Object.keys(response200.content);
    const hasSchema = contentTypes.some((contentType) => {
      const mediaTypeObj = response200.content[contentType];
      return mediaTypeObj && mediaTypeObj.schema;
    });

    if (!hasSchema) {
      return [
        {
          path,
          message:
            'The :reset custom method must return a 200 OK response with the reset resource in the response body.',
        },
      ];
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
