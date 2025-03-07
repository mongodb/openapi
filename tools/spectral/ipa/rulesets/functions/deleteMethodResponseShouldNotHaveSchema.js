import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-108-delete-response-should-be-empty';
const ERROR_MESSAGE = 'DELETE method should return an empty response. The response should not have a schema property.';

/**
 * Delete method should return an empty response
 * @param {object} input - The delete operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path }) => {
  // 1. Filter out not relevant use cases that should not lead to adoption.
  const deleteOp = input;
  if (!deleteOp.responses || deleteOp.responses.length === 0) {
    return;
  }

  // 2. Handle exception on OpenAPI schema
  if (hasException(deleteOp, RULE_NAME)) {
    collectException(deleteOp, RULE_NAME, path);
    return;
  }

  // 3. Validation
  const errors = checkViolations(deleteOp.responses);
  if (errors.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

/**
 * Check if the operation has validation issues
 * @param {object} input - The  object to vefify
 * @return {Array<string>} - errors array (empty if no errors)
 */
function checkViolations(input) {
  const errors = [];
  try {
    if (input && input['204']) {
      const successResponse = input['204'];
      if (successResponse.content) {
        for (const contentType of Object.keys(successResponse.content)) {
          if (successResponse.content[contentType] && successResponse.content[contentType].schema) {
            errors.push({
              message: `Error found for ${contentType}: ${ERROR_MESSAGE}`,
            });
          }
        }
      }
    }
  } catch (e) {
    return [`${RULE_NAME} Internal Rule Error: ${e} Please report issue in https://github.com/mongodb/openapi/issues`];
  }
  return errors;
}
