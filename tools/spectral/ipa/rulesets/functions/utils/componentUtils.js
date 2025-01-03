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
 * Extracts the schema path from the given JSONPath array.
 *
 * This function handles the following types of paths in OpenAPI definitions:
 *
 * 1. **Component Schema Paths**:
 *    - Represented as: `components.schemas.schemaName.enum`
 *    - This path indicates that the enum is defined directly within a schema under `components.schemas`.
 *    - The function returns the first three elements (`["components", "schemas", "schemaName"]`).
 *
 * 2. **Component Schema Property Paths**:
 *    - Represented as: `components.schemas.schemaName.properties.propertyName.enum`
 *    - This path indicates that the enum is defined for a specific property of a schema.
 *    - The function returns up to the property level (`["components", "schemas", "schemaName", "properties", "propertyName"]`).
 *
 * 3. **Parameter Schema Paths**:
 *    - Represented as: `paths.*.method.parameters[*].schema.enum`
 *    - This path indicates that the enum is part of a parameter's schema in an operation.
 *    - The function identifies the location of `schema` in the path and returns everything up to (and including) it.
 *
 * @param {string[]} path - An array representing the JSONPath structure of the OpenAPI definition.
 * @returns {string[]} The truncated path pointing to the schema object or property.
 */

export function getSchemaPath(path) {
  if (path.includes('components')) {
    const propertyIndex = path.findIndex((item) => item === 'properties');
    if (propertyIndex !== -1) {
      // Path is for a component.schema.property enum
      return path.slice(0, propertyIndex + 2);
    }
    // Path is for a component.schema enum
    return path.slice(0, 3);
  } else if (path.includes('paths')) {
    const schemaIndex = path.findIndex((item) => item === 'schema');
    return path.slice(0, schemaIndex + 1);
  }
  return [];
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
