// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isGetTarget } from './utils/conditions/resource.js';
import { checkResponseCodeAndReturnErrors } from './utils/validations/checkResponseCodeAndReturnErrors.js';

const ERROR_MESSAGE =
  'The Get method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code.';

export default defineRule({
  appliesTo: [isGetTarget],
  onInternalError: 'throw',
  check: ({ input, path, ruleName }) => checkResponseCodeAndReturnErrors(input, '200', path, ruleName, ERROR_MESSAGE),
});
