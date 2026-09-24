// @ts-check
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './collectionUtils.js';
import { createRuleContext } from './ruleContext.js';

/**
 * @typedef {import('./conditions/registry.js').Condition} Condition
 * @typedef {import('./ruleContext.js').RuleContext} RuleContext
 * @typedef {Array<{path?: Array<string>, message: string}>} RuleErrors
 */

/**
 * How a rule reports an exception thrown by its check. The modes preserve how rules behaved before defineRule; they
 * are not a recommendation. Conditions are never covered: an exception there always fails the lint run.
 * - 'violation': the internal error is reported, and collected as a violation (or exception, if the component has one)
 * - 'return': the internal error is reported, and nothing is collected
 * - 'throw': the exception propagates and Spectral fails the lint run
 * @typedef {'violation'|'return'|'throw'} InternalErrorMode
 */

/**
 * Builds a Spectral rule function from the conditions under which the rule applies and the check it performs.
 *
 * A call goes through these steps:
 * 1. The rule's `given` in the YAML selects the input.
 * 2. `appliesTo` conditions are evaluated in order. If one fails, the rule does not apply and nothing is collected.
 * 3. `check` returns the validation errors, an empty array meaning the component adopts the rule. What happens when
 *    it throws depends on `onInternalError`.
 * 4. The result is collected as an adoption, violation or exception, reading `x-xgen-IPA-exception` from
 *    `exceptionTarget`.
 *
 * The conditions are attached to the function as `meta`, for generated docs and reports: `appliesTo`, and `checkUses` for
 * conditions the check evaluates itself (e.g. to pick an error message), which have no effect on whether the rule applies.
 *
 * @param {Object} spec
 * @param {Array<Condition>} [spec.appliesTo] conditions that must all hold for the rule to apply
 * @param {(ctx: RuleContext) => RuleErrors} spec.check
 * @param {(ctx: RuleContext) => void} [spec.beforeCheck] runs once the rule applies, outside any try like the conditions, so
 *   an exception fails the lint run instead of being reported as an internal error
 * @param {Array<Condition>} [spec.checkUses] conditions evaluated inside check, listed for docs and reports only
 * @param {(ctx: RuleContext) => Object} [spec.exceptionTarget] the object that carries the exception, defaults to the input
 * @param {import('./ruleContext.js').DocumentKind} [spec.document] the document the context reads, defaults to 'resolved'
 * @param {InternalErrorMode} [spec.onInternalError] what happens when check throws, defaults to 'violation'
 * @returns {Function & {meta: {appliesTo: Array<Condition>, checkUses: Array<Condition>, document: string, onInternalError: InternalErrorMode}}}
 */
export function defineRule({
  appliesTo = [],
  check,
  beforeCheck,
  checkUses = [],
  exceptionTarget = (ctx) => ctx.input,
  document = 'resolved',
  onInternalError = 'violation',
}) {
  const collect = (ctx, errors) =>
    evaluateAndCollectAdoptionStatus(errors, ctx.ruleName, exceptionTarget(ctx), ctx.path);

  const ruleFunction = (input, options, spectralContext) => {
    const ctx = createRuleContext(input, options, spectralContext, document);
    // Spectral names the function in the error when it throws, and every rule here would otherwise be 'ruleFunction'
    Object.defineProperty(ruleFunction, 'name', { value: ctx.ruleName });

    // Conditions are evaluated outside any try, so a condition that throws fails the lint run
    for (const condition of appliesTo) {
      if (!ctx.is(condition)) {
        return;
      }
    }

    beforeCheck?.(ctx);

    switch (onInternalError) {
      case 'violation': {
        let errors;
        try {
          errors = check(ctx);
        } catch (e) {
          errors = handleInternalError(ctx.ruleName, ctx.path, e);
        }
        return collect(ctx, errors);
      }
      case 'return':
        try {
          return collect(ctx, check(ctx));
        } catch (e) {
          return handleInternalError(ctx.ruleName, ctx.path, e);
        }
      case 'throw':
        return collect(ctx, check(ctx));
      default:
        throw new Error(`Unknown onInternalError mode: ${onInternalError}`);
    }
  };

  return Object.assign(ruleFunction, { meta: { appliesTo, checkUses, document, onInternalError } });
}
