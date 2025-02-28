/**
 * Returns a list of all successful response schemas for the passed operation, i.e. for any 2xx response.
 * If a response doesn't have any schema property, an empty array is returned.
 *
 * @param {object} operationObject the object for the operation
 * @returns {Array<{schemaPath: Array<string>, schema: Object}>} all 2xx response schemas and the path to each schema
 */
export function getAllSuccessfulResponseSchemas(operationObject) {
  const getSchema = (schema) => {
    return { schema };
  };

  return forEachSuccessfulResponseSchema(operationObject, getSchema);
}

/**
 * Returns a list of all Schema names for successful responses for the passed operation, i.e. for any 2xx response.
 * If a response doesn't have any schema property or the schemas are unnamed, an empty array is returned.
 *
 * @param {object} operationObject the unresolved object for the operation, containing "$ref" references to any schemas
 * @returns {Array<{schemaPath: Array<string>, schemaName: Object}>} all 2xx response schema names and the path to each schema
 */
export function getAllSuccessfulResponseSchemaNames(operationObject) {
  const getSchemaNameFromSchema = (schema) => {
    if (Object.keys(schema).includes('$ref')) {
      const schemaRefSections = schema['$ref'].split('/');
      return {
        schemaName: schemaRefSections[schemaRefSections.length - 1],
      };
    }
  };

  return forEachSuccessfulResponseSchema(operationObject, getSchemaNameFromSchema);
}

/**
 * For each successful response schema, applies the passed function forEachGet to each schema,
 * and returns the result from the forEachGet as well as the path to the response schema.
 *
 * @param operationObject the operationObject
 * @param {(schema: string) => Object} forEachGet a function applied to each schema in the operationObject
 * @returns {Object[{schemaPath: Array<string>, any}]} an array of all 2xx response schema paths and the result of forEachGet for each schema
 * @returns {Array<Object>} an array of all 2xx response schema paths and the result of forEachGet for each schema, for example [{schemaPath: string[], someProperty: Object}]
 */
function forEachSuccessfulResponseSchema(operationObject, forEachGet) {
  const path = [];

  const responses = operationObject['responses'];
  path.push('responses');

  const successfulResponseKey = Object.keys(responses).filter((k) => k.startsWith('2'))[0];
  path.push(successfulResponseKey);

  const responseContent = responses[successfulResponseKey]['content'];
  path.push('content');

  const result = [];
  Object.keys(responseContent).forEach((k) => {
    const schema = responseContent[k]['schema'];
    if (schema) {
      const schemaPath = path.concat([k]);
      const schemaProperty = forEachGet(schema);
      if (schemaProperty) {
        schemaProperty.schemaPath = schemaPath;
        result.push(schemaProperty);
      }
    }
  });
  return result;
}
