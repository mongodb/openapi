/**
 * Checks if the object has results property
 * @param {Object} schema
 * @returns true if schema object returns results property (pagination), false otherwise
 */
export function schemaIsPaginated(schema) {
  const hasResultsArray = schema.properties && schema.properties.results && schema.properties.results.type === 'array';

  return hasResultsArray;
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
