// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isGetTarget } from './utils/conditions/resource.js';
import { hasSchema, is2xx, isJson } from './utils/conditions/response.js';
import { checkSchemaRefSuffixAndReturnErrors } from './utils/validations/checkSchemaRefSuffixAndReturnErrors.js';

export default defineRule({
  // Reads the unresolved document so the schema $ref name can be checked
  document: 'unresolved',
  appliesTo: [is2xx, hasSchema, isJson, isGetTarget],
  onInternalError: 'throw',
  exceptionTarget: (ctx) => ctx.node,
  check: ({ node, path, ruleName }) => checkSchemaRefSuffixAndReturnErrors(path, node, 'Response', ruleName),
});
