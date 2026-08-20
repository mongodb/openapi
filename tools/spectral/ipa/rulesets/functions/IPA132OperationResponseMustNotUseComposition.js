import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { usesComposition } from './utils/longRunningOperations.js';

const COMPOSITION_ERROR_MESSAGE =
  'OperationResponse must define its properties directly, without allOf, oneOf or anyOf composition.';

/**
 * Checks that the OperationResponse schema defined by IPA-132 is a single flat schema: there is
 * one and only one OperationResponse, so allOf, oneOf and anyOf composition is a violation. The
 * other OperationResponse schema rules skip composed schemas, relying on this rule to reject them.
 *
 * @param {object} input - The OperationResponse schema object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(schema, path, ruleName) {
  try {
    if (usesComposition(schema)) {
      return [{ path, message: COMPOSITION_ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
