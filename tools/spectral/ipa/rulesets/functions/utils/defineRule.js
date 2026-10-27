// @ts-check
import { createRuleContext } from './ruleContext.js';

/**
 * @typedef {import('./conditions/registry.js').Condition} Condition
 * @typedef {import('./ruleContext.js').RuleContext} RuleContext
 * @typedef {Array<{path?: Array<string>, message: string}>} RuleErrors
 */

/**
 * Builds a Spectral rule function from where the rule applies and what it checks.
 *
 * Without it, every rule function reads its context from Spectral, decides where it applies with early `return`s that
 * each rule words its own way, and only then runs its check. A rule using defineRule declares the named conditions it
 * applies under, defined once and shared by every rule that needs them, and the check only does the check:
 *
 *     export default defineRule({
 *       appliesTo: [isSingleton, not(isReadOnly)],
 *       check: ({ input, path }) => (hasPutMethod(input) || hasPatchMethod(input) ? [] : [{ path, message: ERROR_MESSAGE }]),
 *     });
 *
 * Where a rule applies is then readable at a glance, a change to a shared definition is made in one place, and all
 * skipping happens here, so tooling can tell which condition skipped a component.
 *
 * @param {Object} spec
 * @param {Array<Condition>} [spec.appliesTo] conditions that must all hold, evaluated in order; the first that fails skips the
 *   rule, so a later condition may assume the earlier ones held. They run outside any try: a condition that throws fails the
 *   lint run, so a condition must not throw on a component it was not meant for
 * @param {(ctx: RuleContext) => RuleErrors} spec.check returns the errors Spectral reports, an empty array if the component adheres
 * @param {import('./ruleContext.js').DocumentKind} [spec.document] the document the context reads, defaults to 'resolved'
 * @returns {Function & {meta: {appliesTo: Array<Condition>, document: string}}}
 */
export function defineRule({ appliesTo = [], check, document = 'resolved' }) {
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

    return check(ctx);
  };

  return Object.assign(ruleFunction, { meta: { appliesTo, document } });
}
