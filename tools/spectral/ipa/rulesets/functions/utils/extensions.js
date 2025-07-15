export const VERB_OVERRIDE_EXTENSION = 'x-xgen-method-verb-override';

/**
 * Checks if the endpoint has a method with an extension "x-xgen-method-verb-override"
 *
 * @param endpoint the endpoint to evaluate
 * @returns {boolean} true if the endpoint has a nested method with the extension, otherwise false
 */
export function hasMethodWithVerbOverride(endpoint) {
  return Object.values(endpoint).some(hasVerbOverride);
}

/**
 * Checks if the object has an extension "x-xgen-method-verb-override" with the customMethod boolean set to true
 *
 * @param object the object to evaluate
 * @returns {boolean} true if the object has an extension with customMethod=True, otherwise false
 */
export function hasCustomMethodOverride(object) {
  return hasVerbOverride(object) && object[VERB_OVERRIDE_EXTENSION].customMethod;
}

/**
 * Checks if the object has an extension "x-xgen-method-verb-override" with the verb set to a specific verb
 *
 * @param object the object to evaluate
 * @param verb the verb to inspect the extension for
 * @returns {boolean} true if the object has the extension with the given verb, otherwise false
 */
export function hasMethodVerbOverride(object, verb) {
  return hasVerbOverride(object) && object[VERB_OVERRIDE_EXTENSION].verb === verb;
}

/**
 * Checks if the object has an extension "x-xgen-method-verb-override"
 *
 * @param object the object to evaluate
 * @returns {boolean} true if the object has the extension, otherwise false
 */
function hasVerbOverride(object) {
  if (!object[VERB_OVERRIDE_EXTENSION]) {
    return false;
  }
  return true;
}
