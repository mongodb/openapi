import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isCompliantLongRunningOperation } from './utils/longRunningOperations.js';

const ERROR_MESSAGE =
  'The 202 Accepted response must not include a response body schema. The operation handle is conveyed through the Location header.';

/**
 * Checks that the 202 Accepted response of a long-running operation defined by IPA-132 does not
 * include a response body. Media types carrying only versioning metadata, without a schema, are
 * allowed.
 *
 * @param {object} input - The operation object of a mutating method
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;

  if (!isCompliantLongRunningOperation(input)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(operation, path, ruleName) {
  try {
    const acceptedResponse = operation.responses?.['202'];
    if (!acceptedResponse || !acceptedResponse.content) {
      return [];
    }

    const errors = [];
    for (const [mediaType, mediaTypeObject] of Object.entries(acceptedResponse.content)) {
      if (mediaTypeObject && mediaTypeObject.schema) {
        errors.push({ path: [...path, 'responses', '202', 'content', mediaType], message: ERROR_MESSAGE });
      }
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
