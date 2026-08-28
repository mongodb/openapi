import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isNonLegacyLongRunningOperation } from './utils/longRunningOperations.js';

const MISSING_LOCATION_ERROR_MESSAGE =
  'The 202 Accepted response must include a Location header pointing at the Operation resource URI.';
const LOCATION_HEADER = 'Location';
const wrongCasingErrorMessage = (headerName) =>
  `The 202 Accepted response header must be named '${LOCATION_HEADER}', found '${headerName}'.`;

/**
 * Checks that a method starting a long-running operation defined by IPA-132 returns 202 Accepted
 * with a Location header pointing at the Operation resource URI.
 *
 * @param {object} input - The operation object of a mutating method
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;

  if (!isNonLegacyLongRunningOperation(input)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(operation, path, ruleName) {
  try {
    const headers = operation.responses['202'].headers;
    if (headers?.[LOCATION_HEADER] !== undefined) {
      return [];
    }
    // HTTP treats header names as case-insensitive, but the spec standardizes on the canonical
    // casing, so a case variant is reported as a casing violation rather than a missing header
    const caseVariant = headers && Object.keys(headers).find((header) => header.toLowerCase() === 'location');
    const message = caseVariant ? wrongCasingErrorMessage(caseVariant) : MISSING_LOCATION_ERROR_MESSAGE;
    return [{ path: [...path, 'responses', '202'], message }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
