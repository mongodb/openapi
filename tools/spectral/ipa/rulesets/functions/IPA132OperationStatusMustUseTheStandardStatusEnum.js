import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isExactEnumMatch, OPERATION_STATUS_ENUM } from './utils/longRunningOperations.js';

const MISSING_STATUS_ERROR_MESSAGE = 'OperationResponse must report progress through a status field.';
const STATUS_ENUM_ERROR_MESSAGE = `The status field must use exactly the enum [${OPERATION_STATUS_ENUM.join(', ')}].`;

/**
 * Checks that the OperationResponse schema defined by IPA-132 reports progress through a status
 * field using exactly the standard status enum.
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
    const status = schema.properties?.status;
    if (!status) {
      return [{ path, message: MISSING_STATUS_ERROR_MESSAGE }];
    }
    if (!isExactEnumMatch(status.enum, OPERATION_STATUS_ENUM)) {
      return [{ path: [...path, 'properties', 'status'], message: STATUS_ENUM_ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
