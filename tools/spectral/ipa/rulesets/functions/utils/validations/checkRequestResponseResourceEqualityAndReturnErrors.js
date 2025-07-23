import { getSchemaRef } from '../methodUtils.js';
import { isDeepEqual, removeRequestProperties, removeResponseProperties } from '../compareUtils.js';

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
