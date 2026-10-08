// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isReset } from './utils/conditions/path.js';

const ERROR_MESSAGE = 'The :reset custom method must not have a request body.';

export default defineRule({
  appliesTo: [isReset],
  check: ({ input, path }) => (input.requestBody ? [{ path, message: ERROR_MESSAGE }] : []),
});
