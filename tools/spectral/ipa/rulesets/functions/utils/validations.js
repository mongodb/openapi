import { handleInternalError } from './collectionUtils.js';

/**
 * Common validation function for checking that responses have the expected status code.
 * Returns errors in case of violations, ready to be used in a custom validation function.
 *
 * @param {Object} operationObject the operation object to evaluate
 * @param {string} expectedStatusCode the expected status code to validate for
 * @param {string[]} path the path to the operation object being evaluated
 * @param {string} ruleName the rule name
 * @param errorMessage the error message
 * @returns {*[]|[{path, message}]} the errors found, or an empty array in case of no errors
 */
export function checkResponseCodeAndReturnErrors(operationObject, expectedStatusCode, path, ruleName, errorMessage) {
  try {
    const responses = operationObject.responses;
    // If the expected status code is not present, return a violation
    if (!responses || !responses[expectedStatusCode]) {
      return [{ path, message: errorMessage }];
    }

    // If there are other responses within the same status code group (hundreds), return a violation
    if (
      Object.keys(responses).some((key) => key.startsWith(expectedStatusCode.charAt(0)) && key !== expectedStatusCode)
    ) {
      return [{ path, message: errorMessage }];
    }
    return [];
  } catch (e) {
    handleInternalError(ruleName, path, e);
  }
}

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
