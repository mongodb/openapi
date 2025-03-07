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
  if (errors) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

/**
 * Check if the operation has validation issues
 * @param {object} input - The  object to vefify
 * @return {Array<string>|undefined} - The content types that have a schema
 */
function checkViolations(input) {
  try {
    if (input && input['204']) {
      const successResponse = input['204'];
      if (successResponse.content) {
        const errors = [];
        for (const contentType of Object.keys(successResponse.content)) {
          if (successResponse.content[contentType] && successResponse.content[contentType].schema) {
            errors.push({
              message: `Error found for ${contentType}: ${ERROR_MESSAGE}`,
            });
          }
        }
        return errors.length > 0 ? errors : undefined;
      }
    }
  } catch (e) {
    return ['Internal Rule Error without reporting violation' + e];
  }
  // No errors returning undefined
  return undefined;
}
