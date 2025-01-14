import collector, { EntryType } from '../../../metrics/collector.js';
const EXCEPTION_EXTENSION = 'x-xgen-IPA-exception';

/**
 * Checks if the object has an exception extension "x-xgen-IPA-exception"
 *
 * @param object the object to evaluate
 * @param ruleName the name of the exempted rule
 * @returns {boolean} true if the object has an exception named ruleName, otherwise false
 */
export function hasException(object, ruleName, path) {
  if (object[EXCEPTION_EXTENSION]) {
    collector.add(path, ruleName, EntryType.EXCEPTION)
    return Object.keys(object[EXCEPTION_EXTENSION]).includes(ruleName);
  }
  return false;
}
