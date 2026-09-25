import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { ARRAY_SEMANTIC_EXTENSION } from './utils/extensions.js';

const ALLOWED_VALUES = ['list', 'set'];
const ERROR_MESSAGE = `The ${ARRAY_SEMANTIC_EXTENSION} extension must be set to one of ${ALLOWED_VALUES.join(', ')}, and its carrying property must be type: array.`;

/**
 * IPA-131 structural validation for the x-xgen-array-semantic extension.
 *
 * When the extension is present, the carrying property must be `type: array` and the extension value
 * must be `list` or `set`.
 *
 * @param {string} input the property name (from `field: '@key'`)
 * @param _ unused options
 * @param {object} context the context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref), validated separately to prevent duplicate violations
  if (!property) {
    return;
  }

  // The rule only fires when the extension is explicitly declared
  if (!Object.keys(property).includes(ARRAY_SEMANTIC_EXTENSION)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(property, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(property, path, ruleName) {
  try {
    if (property.type !== 'array' || !ALLOWED_VALUES.includes(property[ARRAY_SEMANTIC_EXTENSION])) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
