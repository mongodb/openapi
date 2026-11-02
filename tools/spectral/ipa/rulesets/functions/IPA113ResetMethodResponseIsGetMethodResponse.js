// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isReset } from './utils/conditions/path.js';
import { baseGetHasMediaType, baseGetResponse } from './utils/conditions/resource.js';
import { hasSchema, isJson } from './utils/conditions/response.js';
import { getSchemaRef } from './utils/methodUtils.js';

const ERROR_MESSAGE =
  'The schema in the :reset method response must be the same schema as the response of the Get method.';

export default defineRule({
  document: 'unresolved',
  appliesTo: [isJson, isReset, hasSchema, baseGetHasMediaType],
  exceptionTarget: (ctx) => ctx.node,
  check: (ctx) => {
    const path = ctx.path;
    const getMethodResponseContent = baseGetResponse(ctx);

    // Error if the Get method does not have a schema
    if (!getMethodResponseContent.schema) {
      return [
        {
          path,
          message: `Could not validate that the :reset method returns the same resource object as the Get method. The Get method does not have a schema.`,
        },
      ];
    }

    const resetMethodSchemaRef = getSchemaRef(ctx.node.schema);
    const getMethodSchemaRef = getSchemaRef(getMethodResponseContent.schema);

    // Error if the Get method does not have a schema ref
    if (!getMethodSchemaRef) {
      return [
        {
          path,
          message: `Could not validate that the :reset method returns the same resource object as the Get method. The Get method does not have a schema reference.`,
        },
      ];
    }

    // Error if the get method resource is not the same as the reset method resource
    if (getMethodSchemaRef !== resetMethodSchemaRef) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  },
});
