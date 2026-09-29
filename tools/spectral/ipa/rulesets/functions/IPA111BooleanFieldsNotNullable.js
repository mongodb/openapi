import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const ERROR_MESSAGE = 'Boolean fields must not be nullable.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref) and non-boolean fields:
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property || property.type !== 'boolean') {
    return;
  }

  const errors = checkViolationsAndReturnErrors(property, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(property, path, ruleName) {
  try {
    if (property.nullable === true) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
