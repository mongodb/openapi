// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isGetTarget } from './utils/conditions/resource.js';
import { hasSchema, is2xx, isJson } from './utils/conditions/response.js';
import { checkForbiddenPropertyAttributesAndReturnErrors } from './utils/validations/checkForbiddenPropertyAttributesAndReturnErrors.js';

const ERROR_MESSAGE = 'The get method response object must not include output fields (writeOnly properties).';

export default defineRule({
  appliesTo: [is2xx, hasSchema, isJson, isGetTarget],
  onInternalError: 'throw',
  exceptionTarget: (ctx) => ctx.node,
  check: ({ node, path }) =>
    checkForbiddenPropertyAttributesAndReturnErrors(node.schema, 'writeOnly', path, [], ERROR_MESSAGE),
});
