import {
  evaluateAndCollectAdoptionStatus,
  handleInternalError,
} from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-112-boolean-field-names-avoid-is-prefix';
const IS_PREFIX_REGEX = /^is[A-Z]/;

export default (input, options, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref) and non-boolean fields:
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property || property.type !== 'boolean') {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, property, path);
};

function checkViolationsAndReturnErrors(input, path) {
  try {
    if (IS_PREFIX_REGEX.test(input)) {
      const suggestedName = input.charAt(2).toLowerCase() + input.slice(3);
      const errorMessage = `Boolean field "${input}" should not use the "is" prefix. Use "${suggestedName}" instead.`;
      return [{ path, message: errorMessage }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
