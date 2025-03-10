/**
 * Checks if a string is in camelCase format
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is in camelCase, false otherwise
 */
export function isCamelCase(str) {
  // Must start with lowercase letter
  if (!/^[a-z]/.test(str)) {
    return false;
  }
  // Should not contain underscores or hyphens
  if (/[-_]/.test(str)) {
    return false;
  }
  // Should not have consecutive uppercase letters (not typical in camelCase)
  if (/[A-Z]{2,}/.test(str)) {
    return false;
  }
  return true;
}

/**
 * Checks if a string belongs to a path parameter or a path parameter with a custom method.
 *
 * A path parameter has the format: `{paramName}`
 * A path parameter with a custom method has the format: `{paramName}:customMethod`
 *
 * @param {string} str - A string extracted from a path split by slashes.
 * @returns {boolean} True if the string matches the expected formats, false otherwise.
 */
export function isPathParam(str) {
  const pathParamRegEx = new RegExp(`^{[a-z][a-zA-Z0-9]*}$`);
  const pathParamWithCustomMethodRegEx = new RegExp(`^{[a-z][a-zA-Z0-9]*}:[a-z][a-zA-Z0-9]*$`);
  return pathParamRegEx.test(str) || pathParamWithCustomMethodRegEx.test(str);
}

/**
 * Resolves the value of a nested property within an OpenAPI structure using a given path.
 *
 * This function traverses an OpenAPI object based on a specified path (array of keys)
 * and retrieves the value at the end of the path. If any key in the path is not found,
 * or the value is undefined at any point, the function will return `undefined`.
 *
 * @param {Object} oas - The entire OpenAPI Specification object.
 * @param {string[]} objectPath - An array of strings representing the path to the desired value.
 *                                For example, `['components', 'schemas', 'MySchema', 'properties']`.
 * @returns {*} The value at the specified path within the OpenAPI object, or `undefined` if the path is invalid.
 *
 * @example
 * const oas = {
 *   components: {
 *     schemas: {
 *       MySchema: {
 *         properties: {
 *           fieldName: { type: 'string' }
 *         }
 *       }
 *     }
 *   }
 * };
 *
 * const result = resolveObject(oas, ['components', 'schemas', 'MySchema', 'properties']);
 * console.log(result); // Output: { fieldName: { type: 'string' } }
 */
export function resolveObject(oas, objectPath) {
  return objectPath.reduce((current, key) => {
    return current && current[key] ? current[key] : undefined;
  }, oas);
}
