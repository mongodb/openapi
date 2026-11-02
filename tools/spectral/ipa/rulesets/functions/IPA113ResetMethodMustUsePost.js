// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isReset } from './utils/conditions/path.js';

const ERROR_MESSAGE = 'The :reset custom method must use the POST HTTP method.';
const VALID_METHOD = 'post';
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export default defineRule({
  appliesTo: [isReset],
  check: ({ input, path }) => {
    // POST must be the only HTTP method defined on the path
    const httpMethods = Object.keys(input).filter((key) => HTTP_METHODS.includes(key));
    if (!httpMethods.includes(VALID_METHOD) || httpMethods.length > 1) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  },
});
