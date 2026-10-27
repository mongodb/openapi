// @ts-check
import { getResourcePathItems } from './resourceEvaluation.js';
import { resolveObject } from './componentUtils.js';
import { evaluate } from './conditions/registry.js';

/**
 * @typedef {'resolved'|'unresolved'} DocumentKind
 * @typedef {import('./conditions/registry.js').Condition} Condition
 * @typedef {import('./conditions/registry.js').EvaluationResult} EvaluationResult
 */

/**
 * What conditions and a rule's check read for one call of a rule function: the input, the rule's options, the JSON path,
 * and values derived from them, such as the resource's path items. Spectral passes these as raw arguments, and without
 * a shared context each condition and check would recompute them, for example by calling getResourcePathItems again.
 * Derived values are computed on first use and cached, as are condition results, so a condition used by `appliesTo`
 * and by the check is evaluated once.
 *
 * It is a plain object with no Spectral dependency, so a condition can be tested with a fixture and without a lint run.
 */
export class RuleContext {
  /**
   * @param {Object} params
   * @param {*} params.input the value Spectral passes to the rule function
   * @param {Object} params.options the rule's functionOptions
   * @param {Array<string>} params.path the JSON path of the input, e.g. ['paths', '/groups/{groupId}', 'get']
   * @param {string} params.ruleName
   * @param {{paths: Object}} params.oas the document the rule reads, see {@link DocumentKind}
   */
  constructor({ input, options, path, ruleName, oas }) {
    this.input = input;
    this.options = options;
    this.path = path;
    this.ruleName = ruleName;
    this.oas = oas;
    /** @type {Map<string, EvaluationResult>} */
    this.evaluations = new Map();
    /** @type {Map<string, *>} */
    this.cache = new Map();
  }

  /** @returns {string} the path key, e.g. '/api/atlas/v2/groups/{groupId}' */
  get resourcePath() {
    return this.path[1];
  }

  /** @returns {Object} the path items of the resource at resourcePath, see getResourcePathItems */
  get resourcePathItems() {
    return this.memo('resourcePathItems', () => getResourcePathItems(this.resourcePath, this.oas.paths));
  }

  /** @returns {Object|undefined} the path item at resourcePath */
  get pathItem() {
    return this.oas.paths[this.resourcePath];
  }

  /** @returns {Object|undefined} the operation at path[2], if the path points into one */
  get operation() {
    return this.pathItem?.[this.path[2]];
  }

  /** @returns {*} the value at path in the document the rule reads, or undefined if missing or falsy */
  get node() {
    return this.memo('node', () => resolveObject(this.oas, this.path));
  }

  /**
   * @param {Condition} condition
   * @returns {EvaluationResult}
   */
  evaluate(condition) {
    if (!this.evaluations.has(condition.id)) {
      // Operands go through this cache too, so a condition shared by appliesTo and the check is evaluated once
      this.evaluations.set(
        condition.id,
        evaluate(condition, this, (child) => this.evaluate(child))
      );
    }
    return /** @type {EvaluationResult} */ (this.evaluations.get(condition.id));
  }

  /**
   * @param {Condition} condition
   * @returns {boolean}
   */
  is(condition) {
    return this.evaluate(condition).pass;
  }

  /**
   * @param {string} resourcePath another path key in the same document, e.g. the base resource of a custom method
   * @returns {RuleContext} a context for that path, without an input
   */
  atPath(resourcePath) {
    return new RuleContext({
      input: undefined,
      options: this.options,
      path: ['paths', resourcePath],
      ruleName: this.ruleName,
      oas: this.oas,
    });
  }

  /**
   * @param {string} key
   * @param {() => *} compute
   */
  memo(key, compute) {
    if (!this.cache.has(key)) {
      this.cache.set(key, compute());
    }
    return this.cache.get(key);
  }
}

/**
 * Creates the context for one call of a rule function.
 *
 * @param {*} input
 * @param {Object} options
 * @param {{path: Array<string>, documentInventory: {resolved: Object, unresolved: Object}, rule: {name: string}}} spectralContext
 * @param {DocumentKind} document which document the rule reads; independent of the rule's YAML `resolved` flag
 * @returns {RuleContext}
 */
export function createRuleContext(input, options, { path, documentInventory, rule }, document) {
  return new RuleContext({
    input,
    options,
    path,
    ruleName: rule.name,
    oas: documentInventory[document],
  });
}
