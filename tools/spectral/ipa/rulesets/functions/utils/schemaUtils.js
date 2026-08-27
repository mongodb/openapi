import { resolveObject } from './componentUtils.js';

/**
 * Checks if a schema property is listed as required by its parent schema.
 *
 * Given the JSON path to a property (ending in `['properties', '<name>']`), this resolves the
 * enclosing schema object and inspects its `required` array.
 *
 * @param {Object} oas the OpenAPI Specification object to resolve against
 * @param {string[]} propertyPath the JSON path to the property
 * @returns {boolean} true if the property is listed in the parent schema's `required` array, false otherwise
 */
export function isRequiredProperty(oas, propertyPath) {
  const propertyName = propertyPath[propertyPath.length - 1];
  const parentSchema = resolveObject(oas, propertyPath.slice(0, propertyPath.length - 2));
  return Array.isArray(parentSchema?.required) && parentSchema.required.includes(propertyName);
}

/**
 * Checks if the object has results property
 * @param {Object} schema
 * @returns true if schema object returns results property (pagination), false otherwise
 */
export function schemaIsPaginated(schema) {
  return schema.properties?.results?.type === 'array';
}

/**
 * Checks if schema is an array type of schema
 *
 * @param {Object} schema
 * @returns
 */
export function schemaIsArray(schema) {
  const fields = Object.keys(schema);
  return fields.includes('type') && schema['type'] === 'array';
}

/**
 * Checks if schema is an object type of schema
 *
 * @param {Object} schema
 * @returns
 */
export function schemaIsObject(schema) {
  const fields = Object.keys(schema);
  return fields.includes('type') && schema['type'] === 'object';
}

export function getSchemaPathFromEnumPath(path) {
  const enumIndex = path.lastIndexOf('enum');
  if (path[enumIndex - 1] === 'items') {
    return path.slice(0, enumIndex - 1);
  }
  return path.slice(0, enumIndex);
}

/**
 * Split camelCase string into words
 * Example: "myProjectId" becomes ["my", "Project", "Id"]
 * @param str {string} camelCase string
 * @returns {string[]}
 */
export function splitCamelCase(str) {
  if (!str) return [''];

  // Special handling for single words
  if (!/[A-Z]/.test(str)) return [str];

  return str.split(/(?=[A-Z])/).map((word) => word.toLowerCase());
}
