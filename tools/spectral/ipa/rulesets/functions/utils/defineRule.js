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
 * Builds a Spectral rule function from where the rule applies and what it checks.
 *
 * Without it, every rule function reads its context from Spectral, decides where it applies with early `return`s that
 * each rule words its own way, runs its check in a copied try/catch, and records the result itself. A rule using
 * defineRule declares the named conditions it applies under, defined once and shared by every rule that needs them,
 * and the check only does the check:
 *
 *     export default defineRule({
 *       appliesTo: [isSingleton, not(isReadOnly)],
 *       check: ({ input, path }) => (hasPutMethod(input) || hasPatchMethod(input) ? [] : [{ path, message: ERROR_MESSAGE }]),
 *     });
 *
 * Where a rule applies is then readable at a glance, a change to a shared definition is made in one place, and every
 * rule records adoptions, violations, exceptions and internal errors the same way. All skipping happens here, so tooling
 * can tell which condition skipped a component.
 *
 * The conditions are attached to the function as `meta`, for generated docs and reports: `appliesTo`, and `checkUses` for
 * conditions the check evaluates itself (e.g. to pick an error message), which have no effect on whether the rule applies.
 *
 * @param {Object} spec
 * @param {Array<Condition>} [spec.appliesTo] conditions that must all hold, evaluated in order; the first that fails skips the
 *   rule, so a later condition may assume the earlier ones held. They run outside any try: a condition that throws fails the
 *   lint run, so a condition must not throw on a component it was not meant for
 * @param {(ctx: RuleContext) => RuleErrors} spec.check returns the errors Spectral reports, an empty array if the component
 *   adheres. If it throws, `onInternalError` decides what happens
 * @param {(ctx: RuleContext) => void} [spec.beforeCheck] runs once the rule applies, outside any try like the conditions, so
 *   an exception fails the lint run instead of being reported as an internal error
 * @param {Array<Condition>} [spec.checkUses] conditions evaluated inside check, listed for docs and reports only. They may
 *   be evaluated on another component than the rule's own, e.g. the base resource of a custom method
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
