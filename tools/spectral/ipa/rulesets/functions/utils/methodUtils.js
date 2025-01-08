/**
 * Returns a list of all successful response schemas for the 'get' method of the passed resource, i.e. for any 2xx response.
 *
 * @param {object} pathObject the object for the path
 * @returns {Object[]} all 2xx 'get' response schemas
 */
export function getAllSuccessfulGetResponseSchemas(pathObject) {
  const responses = pathObject['get']['responses'];
  const successfulResponseKey = Object.keys(responses).filter((k) => k.startsWith('2'))[0];
  const responseContent = responses[successfulResponseKey]['content'];
  const result = [];
  Object.keys(responseContent).forEach((k) => {
    const schema = responseContent[k]['schema'];
    if (schema) {
      result.push(schema);
    }
  });
  return result;
}
