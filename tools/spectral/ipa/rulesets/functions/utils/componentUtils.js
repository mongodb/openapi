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

/**
 * Checks if a path array points to a specific response version, for example:
 * [
 *   "paths",
 *   "/resource/{id}",
 *   "get",
 *   "responses",
 *   "200",
 *   "content",
 *   "application/vnd.atlas.2023-08-05+json",
 * ],
 *
 * The array may have more elements beyond the version.
 *
 * @param {string[]} path
 * @returns {boolean}
 */
export function pathIsForResponseVersion(path) {
  return path.length > 6 && path[0] === 'paths' && path[3] === 'responses' && path[5] === 'content';
}

/**
 * Checks if a path array points to a specific request body version, for example:
 * [
 *   "paths",
 *   "/resource/{id}",
 *   "get",
 *   "requestBody",
 *   "content",
 *   "application/vnd.atlas.2023-08-05+json",
 * ],
 *
 * The array may have more elements beyond the version.
 *
 * @param {string[]} path
 * @returns {boolean}
 */
export function pathIsForRequestVersion(path) {
  return path.length > 5 && path[0] === 'paths' && path[3] === 'requestBody' && path[4] === 'content';
}
