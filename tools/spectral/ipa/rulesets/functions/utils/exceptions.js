import collector, { EntryType } from '../../../metrics/collector.js';

const EXCEPTION_EXTENSION = 'x-xgen-IPA-exception';

/**
 * Checks if the object has an exception extension "x-xgen-IPA-exception"
 *
 * @param object the object to evaluate
 * @param ruleName the name of the exempted rule
 * @returns {boolean} true if the object has an exception named ruleName, otherwise false
 */
export function hasException(object, ruleName) {
  if (object[EXCEPTION_EXTENSION]) {
    return Object.keys(object[EXCEPTION_EXTENSION]).includes(ruleName);
  }
  return false;
}

/**
 * Collects an exception entry.
 *
 * @param object the object to evaluate
 * @param {string} path - The JSON path for the object where the rule exception occurred.
 * @param {string} ruleName - The name of the rule that the exception is defined for.
 */
export function collectException(object, ruleName, path) {
  let exceptionReason = object[EXCEPTION_EXTENSION][ruleName];
  if (exceptionReason) {
    collector.add(EntryType.EXCEPTION, path, ruleName, exceptionReason);
  }
}
