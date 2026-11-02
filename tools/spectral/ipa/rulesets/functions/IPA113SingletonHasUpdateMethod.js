// @ts-check
import { defineRule } from './utils/defineRule.js';
import { not } from './utils/conditions/registry.js';
import { isReadOnly, isSingleton } from './utils/conditions/resource.js';
import { hasPatchMethod, hasPutMethod } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE =
  'Singleton resources should define the Update method. If this is not a singleton resource, please implement all CRUDL methods.';

export default defineRule({
  appliesTo: [isSingleton, not(isReadOnly)],
  check: ({ input, path }) => (hasPutMethod(input) || hasPatchMethod(input) ? [] : [{ path, message: ERROR_MESSAGE }]),
});
