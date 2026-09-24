// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isReset } from './utils/conditions/path.js';
import { isSingleton } from './utils/conditions/resource.js';
import { stripCustomMethodName } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'The :reset custom method must only be defined on singleton resources.';

export default defineRule({
  appliesTo: [isReset],
  checkUses: [isSingleton],
  check: (ctx) => {
    const baseResource = ctx.atPath(stripCustomMethodName(ctx.resourcePath));
    return baseResource.is(isSingleton) ? [] : [{ path: ctx.path, message: ERROR_MESSAGE }];
  },
});
