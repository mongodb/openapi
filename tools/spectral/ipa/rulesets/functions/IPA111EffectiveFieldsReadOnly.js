import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { pathIsForRequestVersion, resolveObject } from './utils/componentUtils.js';

const EFFECTIVE_PREFIX_REGEX = /^effective[A-Z]/;
const REQUEST_ERROR_MESSAGE =
  'Effective-value fields represent server-computed state and must not appear in request schemas.';
const READ_ONLY_ERROR_MESSAGE = 'Effective-value fields must be marked as readOnly: true.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref):
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property) {
    return;
  }

  // The rule only applies to effective-value fields, identified by the "effective" prefix
  if (!EFFECTIVE_PREFIX_REGEX.test(input)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(property, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(property, path, ruleName) {
  try {
    if (pathIsForRequestVersion(path)) {
      return [{ path, message: REQUEST_ERROR_MESSAGE }];
    }
    if (property.readOnly !== true) {
      return [{ path, message: READ_ONLY_ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
