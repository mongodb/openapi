import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-108-delete-response-should-be-empty';
const ERROR_MESSAGE = 'DELETE method should return an empty response. The response should not have a schema property.';

/**
 * Delete method should return an empty response
 * @param {object} input - The delete operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path }) => {
  // 1. Handle exception on OpenAPI schema
  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  // 2. Validation
  const errors = checkViolations(input, path);
  if (errors.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

/**
 * Check if the operation has validation issues
 * @param {object} input - The  object to vefify
 * @param {object} jsonPathArray - The jsonPathArray covering location in the OpenAPI schema
 * @return {Array<string>} - errors array ()
 */
function checkViolations(input, jsonPathArray) {
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
    handleInternalError(RULE_NAME, jsonPathArray, e);
  }
  return errors;
}
