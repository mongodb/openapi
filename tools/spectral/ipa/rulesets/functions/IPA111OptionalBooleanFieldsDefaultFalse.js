import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { isRequiredProperty } from './utils/schemaUtils.js';

const ERROR_MESSAGE = 'Optional boolean fields must default to false.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref) and non-boolean fields:
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property || property.type !== 'boolean') {
    return;
  }

  // The rule only applies to optional fields
  if (isRequiredProperty(oas, path)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(property, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(property, path, ruleName) {
  try {
    if (property.default !== false) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
