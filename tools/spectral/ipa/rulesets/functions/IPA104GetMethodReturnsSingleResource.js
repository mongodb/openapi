// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isGetTarget, isSingleton } from './utils/conditions/resource.js';
import { hasSchema, is2xx, isJson } from './utils/conditions/response.js';
import { schemaIsArray, schemaIsPaginated } from './utils/schemaUtils.js';

const ERROR_MESSAGE_STANDARD_RESOURCE =
  'Get methods should return data for a single resource. This method returns an array or a paginated response.';
const ERROR_MESSAGE_SINGLETON_RESOURCE =
  'Get methods for singleton resource should return data for a single resource. This method returns an array or a paginated response. If this is not a singleton resource, please implement all standard methods.';

export default defineRule({
  appliesTo: [is2xx, hasSchema, isJson, isGetTarget],
  checkUses: [isSingleton],
  exceptionTarget: (ctx) => ctx.node,
  check: (ctx) => {
    const schema = ctx.node.schema;
    if (schemaIsPaginated(schema) || schemaIsArray(schema)) {
      return [
        {
          path: ctx.path,
          message: ctx.is(isSingleton) ? ERROR_MESSAGE_SINGLETON_RESOURCE : ERROR_MESSAGE_STANDARD_RESOURCE,
        },
      ];
    }
    return [];
  },
});
