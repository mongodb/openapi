export const VERB_OVERRIDE_EXTENSION = 'x-xgen-method-verb-override';

/**
 * Checks if the object has the extension "x-xgen-method-verb-override"
 *
 * @param object the object to evaluate
 * @returns {boolean} true if the object has verb override extension, otherwise false
 */
export function hasVerbOverride(object) {
  if (object[VERB_OVERRIDE_EXTENSION]) {
    return true;
  }
  return false;
}