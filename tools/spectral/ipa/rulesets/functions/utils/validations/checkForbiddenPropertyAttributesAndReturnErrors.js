/**
 * Recursively searches a schema to find properties with a specific attribute,
 * and returns errors if such a property is found, ready to be used in a custom validation function.
 *
 * @param {Object} schema - The schema to check
 * @param {string} attributeName - The attribute to check for (e.g. 'readOnly', 'writeOnly')
 * @param {Array} path - The path to the current schema in the document
 * @param {Array} errors - Accumulator for errors found
 * @param {string} errorMessage - The base error message to use
 * @param {Array} propPath - The current property path (for error messages)
 * @returns {Array} The accumulated errors
 */
export function checkForbiddenPropertyAttributesAndReturnErrors(
  schema,
  attributeName,
  path,
  errors,
  errorMessage,
  propPath = []
) {
  if (!schema || typeof schema !== 'object') {
    return errors;
  }

  // Check if this schema has the attribute set to true
  if (schema[attributeName] === true) {
    errors.push({
      path,
      message:
        propPath.length > 0
          ? `${errorMessage} Found ${attributeName} property at: ${propPath.join('.')}.`
          : `${errorMessage} Found ${attributeName} property at one of the inline schemas.`,
    });
    return errors;
  }

  // Check properties in object schemas
  if (schema.properties) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      checkForbiddenPropertyAttributesAndReturnErrors(propSchema, attributeName, path, errors, errorMessage, [
        ...propPath,
        propName,
      ]);
    }
  }

  // Check items in array schemas
  if (schema.items) {
    checkForbiddenPropertyAttributesAndReturnErrors(schema.items, attributeName, path, errors, errorMessage, [
      ...propPath,
      'items',
    ]);
  }

  // Check allOf, anyOf, oneOf schemas
  ['allOf', 'anyOf', 'oneOf'].forEach((combiner) => {
    if (Array.isArray(schema[combiner])) {
      schema[combiner].forEach((subSchema, index) => {
        checkForbiddenPropertyAttributesAndReturnErrors(subSchema, attributeName, path, errors, errorMessage, [
          ...propPath,
          combiner,
          index,
        ]);
      });
    }
  });

  return errors;
}
