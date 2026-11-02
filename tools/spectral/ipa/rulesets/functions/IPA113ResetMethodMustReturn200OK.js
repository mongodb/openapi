// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isReset } from './utils/conditions/path.js';
import { checkResponseCodeAndReturnErrors } from './utils/validations/checkResponseCodeAndReturnErrors.js';

const ERROR_MESSAGE =
  'The :reset custom method must return a 200 OK response with the reset resource in the response body. This method either lacks a 200 OK response or defines a different 2xx status code.';
const MISSING_BODY_ERROR_MESSAGE =
  'The :reset custom method must return a 200 OK response with the reset resource in the response body.';

export default defineRule({
  appliesTo: [isReset],
  check: ({ input, path, ruleName }) => {
    // First check if 200 OK response exists
    const responseCodeErrors = checkResponseCodeAndReturnErrors(input, '200', path, ruleName, ERROR_MESSAGE);
    if (responseCodeErrors.length > 0) {
      return responseCodeErrors;
    }

    // Check that the 200 response has a body, and at least one content type has a schema
    const response200 = input.responses['200'];
    const hasSchema =
      response200?.content &&
      Object.values(response200.content).some((mediaTypeObject) => mediaTypeObject && mediaTypeObject.schema);
    if (!hasSchema) {
      return [{ path, message: MISSING_BODY_ERROR_MESSAGE }];
    }
    return [];
  },
});
