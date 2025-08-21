import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isSingleResourceIdentifier } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'DELETE method should return an empty response. The response should not have a schema property.';

/**
 * Delete method should return an empty response
 * @param {object} input - The delete operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  const pathString = path[1]; // Extract the resource path
  if (!isSingleResourceIdentifier(pathString)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

/**
 * Check if the operation has validation issues
 * @param {object} input - The  object to verify
 * @param {Array<string>} jsonPathArray - The jsonPathArray covering location in the OpenAPI schema
 * @param ruleName the name of the Spectral rule under validation
 * @return {Array<{path: Array<string>, message: string}>} - errors array ()
 */
function checkViolationsAndReturnErrors(input, jsonPathArray, ruleName) {
  const errors = [];
  try {
    const successResponse = input;
    if (successResponse.content) {
      for (const contentType of Object.keys(successResponse.content)) {
        if (successResponse.content[contentType] && successResponse.content[contentType].schema) {
          errors.push({
            path: jsonPathArray,
            message: `Error found for ${contentType}: ${ERROR_MESSAGE}`,
          });
        }
      }
    }
  } catch (e) {
    return handleInternalError(ruleName, jsonPathArray, e);
  }
  return errors;
}
