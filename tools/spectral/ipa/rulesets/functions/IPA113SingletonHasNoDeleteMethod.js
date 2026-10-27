// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isSingleton } from './utils/conditions/resource.js';
import { hasDeleteMethod } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE =
  'Singleton resources must not define the Delete standard method. If this is not a singleton resource, please implement all CRUDL methods.';

export default defineRule({
  appliesTo: [isSingleton],
  check: ({ input, path }) => (hasDeleteMethod(input) ? [{ path, message: ERROR_MESSAGE }] : []),
});
