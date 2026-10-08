// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isCollection } from './utils/conditions/path.js';
import { hasSingletonShape, instancePath } from './utils/conditions/resource.js';
import { hasGetMethod } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'APIs must provide a get method for resources.';

export default defineRule({
  appliesTo: [isCollection],
  checkUses: [hasSingletonShape],
  exceptionTarget: (ctx) => ctx.pathItem,
  check: (ctx) => {
    const error = [{ path: ctx.path, message: ERROR_MESSAGE }];
    // A singleton has its Get on the first of its paths (in spec order), other resources on the instance path
    if (ctx.is(hasSingletonShape)) {
      const [firstPath] = Object.keys(ctx.resourcePathItems);
      return hasGetMethod(ctx.resourcePathItems[firstPath]) ? [] : error;
    }
    const instance = instancePath(ctx);
    return instance && hasGetMethod(ctx.oas.paths[instance]) ? [] : error;
  },
});
