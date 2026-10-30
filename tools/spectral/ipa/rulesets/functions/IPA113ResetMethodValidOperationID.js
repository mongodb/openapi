// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isReset } from './utils/conditions/path.js';
import { stripCustomMethodName } from './utils/resourceEvaluation.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

export default defineRule({
  appliesTo: [isReset],
  onInternalError: 'return',
  check: ({ input, options, path, resourcePath }) =>
    validateOperationIdAndReturnErrors(
      'reset',
      stripCustomMethodName(resourcePath),
      input,
      path,
      options.ignoreSingularizationList
    ),
});
