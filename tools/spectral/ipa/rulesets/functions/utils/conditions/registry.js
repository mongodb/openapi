// @ts-check
// Named conditions that decide whether a rule applies to a component.
//
// A rule declares its conditions (see defineRule.js) instead of hiding them in early returns, so the same
// definition is shared across rules and can be documented, counted and traced in one place.

/**
 * @typedef {import('../ruleContext.js').RuleContext} RuleContext
 */

/**
 * @typedef {Object} Condition
 * @property {string} id unique; the part before the dot is the subject, e.g. 'resource.isSingleton' (checked by the tests)
 * @property {'leaf'|'allOf'|'anyOf'|'not'} op
 * @property {(ctx: RuleContext) => unknown} [fn] predicate for leaf conditions; reads the rule context
 * @property {Array<Condition>} [children] operands for allOf/anyOf/not
 * @property {string} [label] short phrase completing "Applies when ...", rendered in the rule docs
 * @property {string} [subject] what the condition is evaluated on, e.g. 'path', 'resource', 'operation'
 * @property {string} [definition] plain-English definition, rendered in the glossary
 * @property {{match: Array<Object>, noMatch: Array<Object>}} [examples] rule context fixtures, run by the tests; each may
 *   have a `note` saying what makes it (not) match, shown in the glossary when that is not visible in its path
 * @property {string} [variantOf] id of the condition this one is a divergent variant of
 * @property {string} [divergence] how this variant differs from variantOf, and where it is used
 * @property {boolean} [readsRuleOptions] the result depends on the rule's functionOptions, so it has no rule-independent count
 */

/**
 * @typedef {Object} EvaluationResult
 * @property {boolean} pass
 * @property {Array<string>} failedAt condition ids from the evaluated condition down to the one that failed; empty on pass
 */

/** @type {Map<string, Condition>} */
const registry = new Map();

/**
 * Defines and registers a named condition. Provide either fn (a leaf) or of (a named combination of conditions).
 *
 * @param {Omit<Condition, 'op'|'children'> & {of?: Condition}} spec
 * @returns {Condition}
 */
export function defineCondition({ of, ...spec }) {
  if (registry.has(spec.id)) {
    throw new Error(`Condition ${spec.id} is already defined`);
  }
  /** @type {Condition} */
  const condition = of ? { ...spec, op: of.op, children: of.children } : { ...spec, op: 'leaf' };
  registry.set(condition.id, condition);
  return condition;
}

/**
 * @param {Condition} condition
 * @returns {Condition} holds when condition does not
 */
export function not(condition) {
  return { id: `not(${condition.id})`, op: 'not', children: [condition] };
}

/**
 * @param {...Condition} conditions evaluated in order, stopping at the first that fails
 * @returns {Condition} holds when all conditions hold
 */
export function allOf(...conditions) {
  return { id: `allOf(${conditions.map((c) => c.id).join(', ')})`, op: 'allOf', children: conditions };
}

/**
 * @param {...Condition} conditions evaluated in order, stopping at the first that holds
 * @returns {Condition} holds when at least one condition holds
 */
export function anyOf(...conditions) {
  return { id: `anyOf(${conditions.map((c) => c.id).join(', ')})`, op: 'anyOf', children: conditions };
}

/**
 * Evaluates a condition, short-circuiting like && and ||.
 *
 * @param {Condition} condition
 * @param {RuleContext} ctx
 * @param {(condition: Condition) => EvaluationResult} [evaluateChild] evaluates operands, e.g. with a cache; defaults
 *   to evaluating them directly
 * @returns {EvaluationResult}
 */
export function evaluate(condition, ctx, evaluateChild = (child) => evaluate(child, ctx, evaluateChild)) {
  const children = condition.children ?? [];
  switch (condition.op) {
    case 'leaf':
      return condition.fn?.(ctx) ? passed() : failed(condition);
    case 'not':
      return evaluateChild(children[0]).pass ? failed(condition) : passed();
    case 'allOf':
      for (const child of children) {
        const result = evaluateChild(child);
        if (!result.pass) {
          // Report the named composite as well as the operand that failed, e.g. ['resource.isSingleton', 'path.isCollection']
          return { pass: false, failedAt: isNamed(condition) ? [condition.id, ...result.failedAt] : result.failedAt };
        }
      }
      return passed();
    case 'anyOf':
      return children.some((child) => evaluateChild(child).pass) ? passed() : failed(condition);
    default:
      throw new Error(`Unknown condition op: ${condition.op}`);
  }
}

/**
 * @returns {Array<Condition>} all named conditions, in definition order
 */
export function listConditions() {
  return [...registry.values()];
}

// By id rather than identity, so conditions from another copy of this module (e.g. Spectral's bundle) are recognized
function isNamed(condition) {
  return registry.has(condition.id);
}

function passed() {
  return { pass: true, failedAt: [] };
}

function failed(condition) {
  return { pass: false, failedAt: [condition.id] };
}
