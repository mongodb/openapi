export const VERB_OVERRIDE_EXTENSION = 'x-xgen-method-verb-override';
export const OPERATION_ID_OVERRIDE_EXTENSION = 'x-xgen-operation-id-override';

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
  return hasVerbOverride(object) && object[VERB_OVERRIDE_EXTENSION].verb.startsWith(verb);
}

/**
 * Checks if the operation has an extension "x-xgen-method-verb-override"
 *
 * @param operation the operation to evaluate
 * @returns {boolean} true if the operation has the extension, otherwise false
 */
export function hasVerbOverride(operation) {
  return Object.keys(operation).includes(VERB_OVERRIDE_EXTENSION);
}

/**
 * Checks if the endpoint has a method with an extension "x-xgen-operation-id-override"
 *
 * @param operation the endpoint to evaluate
 * @returns {boolean} true if the endpoint has a nested method with the extension, otherwise false
 */
export function hasOperationIdOverride(operation) {
  return Object.keys(operation).includes(OPERATION_ID_OVERRIDE_EXTENSION);
}

/**
 * Returns the operation id override from the endpoint.
 *
 * @param endpoint the endpoint to evaluate
 * @returns {string|undefined} the operation id override if it exists, otherwise undefined
 */
export function getOperationIdOverride(endpoint) {
  return endpoint[OPERATION_ID_OVERRIDE_EXTENSION];
}
