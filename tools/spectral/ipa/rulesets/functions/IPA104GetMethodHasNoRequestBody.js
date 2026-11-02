// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isGetTarget } from './utils/conditions/resource.js';

const ERROR_MESSAGE = 'The Get method must not include a request body.';

export default defineRule({
  appliesTo: [isGetTarget],
  onInternalError: 'throw',
  check: ({ input, path }) => (input.requestBody ? [{ path, message: ERROR_MESSAGE }] : []),
});
