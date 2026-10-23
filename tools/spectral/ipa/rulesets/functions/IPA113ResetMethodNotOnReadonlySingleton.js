// @ts-check
import { defineRule } from './utils/defineRule.js';
import { isReset } from './utils/conditions/path.js';
import { isReadOnly } from './utils/conditions/resource.js';
import { stripCustomMethodName } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE =
  'Read-only singleton resources must not define a :reset custom method. Read-only resources cannot be modified, so reset is not applicable.';

// Despite the rule name, the base resource is not required to be a singleton: any read-only resource with :reset violates
export default defineRule({
  appliesTo: [isReset],
  checkUses: [isReadOnly],
  check: (ctx) => {
    const baseResource = ctx.atPath(stripCustomMethodName(ctx.resourcePath));
    return baseResource.is(isReadOnly) ? [{ path: ctx.path, message: ERROR_MESSAGE }] : [];
  },
});
