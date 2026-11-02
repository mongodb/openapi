// @ts-check
// Conditions that decide which operations the operation ID rules of the standard methods apply to (see
// utils/operationIdRules.js for the rules).

import { anyOf, not } from './registry.js';
import { hasCustomMethodOverride, hasListVerbOverride, hasRuleMethodVerbOverride } from './operation.js';
import { isLegacyGetTarget } from './resource.js';
import { hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from '../extensions.js';

/**
 * @returns {Array<import('./registry.js').Condition>} the operation is a Get: not a custom method or List by verb
 * override, and either on a Get path or declared a Get by verb override
 */
export function getOperationIdRuleConditions() {
  return [not(hasCustomMethodOverride), not(hasListVerbOverride), anyOf(isLegacyGetTarget, hasRuleMethodVerbOverride)];
}

/**
 * @param {Object} operation
 * @param {string} methodName the rule's methodName option
 * @returns {string} the verb from the operation's verb override if it overrides methodName, otherwise methodName
 */
export function getMethodName(operation, methodName) {
  return hasMethodVerbOverride(operation, methodName) ? operation[VERB_OVERRIDE_EXTENSION].verb : methodName;
}
