export function schemaIsPaginated(schema) {
  const fields = Object.keys(schema);
  return fields.includes('properties') && Object.keys(schema['properties']).includes('results');
}

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
 * Recursively searches a schema to find properties with a specific attribute
 *
 * @param {Object} schema - The schema to check
 * @param {string} attributeName - The attribute to check for (e.g. 'readOnly', 'writeOnly')
 * @param {Array} path - The path to the current schema in the document
 * @param {Array} errors - Accumulator for errors found
 * @param {string} errorMessage - The base error message to use
 * @param {Array} propPath - The current property path (for error messages)
 * @returns {Array} The accumulated errors
 */
export function findPropertiesByAttribute(schema, attributeName, path, errors = [], errorMessage, propPath = []) {
  if (!schema || typeof schema !== 'object') {
    return errors;
  }

  // Check if this schema has the attribute set to true
  if (schema[attributeName] === true) {
    errors.push({
      path,
      message: `${errorMessage} Found ${attributeName} property at: ${propPath.join('.')}`,
    });
    return errors;
  }

  // Check properties in object schemas
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      findPropertiesByAttribute(propSchema, attributeName, path, errors, errorMessage, [...propPath, propName]);
    }
  }

  // Check items in array schemas
  if (schema.items) {
    findPropertiesByAttribute(schema.items, attributeName, path, errors, errorMessage, [...propPath, 'items']);
  }

  // Check allOf, anyOf, oneOf schemas
  ['allOf', 'anyOf', 'oneOf'].forEach((combiner) => {
    if (Array.isArray(schema[combiner])) {
      schema[combiner].forEach((subSchema, index) => {
        findPropertiesByAttribute(subSchema, attributeName, path, errors, errorMessage, [...propPath, combiner, index]);
      });
    }
  });

  return errors;
}