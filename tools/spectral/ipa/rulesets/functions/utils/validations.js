import { handleInternalError } from './collectionUtils.js';
import { getSchemaRef } from './methodUtils.js';
import { isDeepEqual, removeRequestProperties, removeResponseProperties } from './compareUtils.js';

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

/**
 * Checks if a request body schema matches a response schema.
 * writeOnly:true properties of the request will be ignored.
 * readOnly:true properties of the response will be ignored.
 * Returns errors if the schemas are not equal, ready to be used in a custom validation function.
 *
 * @param {string[]} path the path to the request object being evaluated
 * @param {object} requestContent the resolved request content for a media type
 * @param {object} responseContent the resolved response content for a media type
 * @param {object} requestContentUnresolved the unresolved request content for a media type
 * @param {object} responseContentUnresolved the unresolved response content for a media type
 * @param {'Create' | 'Update'} requestMethod the method of the request, e.g. 'create', 'update'
 * @param {'Get' | 'List'} responseMethod the method of the response, e.g. 'get', 'list'
 * @param {string} errorMessage the error message
 * @returns {[{path, message: string}]} the errors found, or an empty array in case of no errors
 */
export function checkRequestResponseResourceEqualityAndReturnErrors(
  path,
  requestContent,
  responseContent,
  requestContentUnresolved,
  responseContentUnresolved,
  requestMethod,
  responseMethod,
  errorMessage
) {
  const errors = [];

  if (!responseContent.schema) {
    return [
      {
        path,
        message: `Could not validate that the ${requestMethod} request body schema matches the response schema of the ${responseMethod} method. The ${responseMethod} method does not have a schema.`,
      },
    ];
  }

  const requestSchemaRef = getSchemaRef(requestContentUnresolved.schema);
  const responseSchemaRef = getSchemaRef(responseContentUnresolved.schema);

  if (requestSchemaRef && responseSchemaRef) {
    if (requestSchemaRef === responseSchemaRef) {
      return [];
    }
  }

  const filteredRequestSchema = removeRequestProperties(requestContent.schema);
  const filteredResponseSchema = removeResponseProperties(responseContent.schema);

  if (!isDeepEqual(filteredRequestSchema, filteredResponseSchema)) {
    errors.push({
      path,
      message: errorMessage,
    });
  }

  return errors;
}

/**
 * Checks if a request or response content for a media type references a schema with a specific suffix.
 * Returns errors if the schema doesn't reference a schema, or if the schema name does not end with the expected suffix.
 * Ready to be used in a custom validation function.
 *
 * @param {string[]} path the path to the object being evaluated
 * @param {object} contentPerMediaType the content to evaluate for a specific media type (unresolved)
 * @param {string} expectedSuffix the expected suffix to evaluate the schema name for
 * @param {string} ruleName the rule name
 * @returns {[{path, message: string}]} the errors found, or an empty array in case of no errors
 */
export function checkSchemaRefSuffixAndReturnErrors(path, contentPerMediaType, expectedSuffix, ruleName) {
  try {
    const schema = contentPerMediaType.schema;
    const schemaRef = getSchemaRef(schema);

    if (!schemaRef) {
      return [
        {
          path,
          message: 'The schema is defined inline and must reference a predefined schema.',
        },
      ];
    }
    if (!schemaRef.endsWith(expectedSuffix)) {
      return [
        {
          path,
          message: `The schema must reference a schema with a ${expectedSuffix} suffix.`,
        },
      ];
    }
    return [];
  } catch (e) {
    handleInternalError(ruleName, path, e);
  }
}
