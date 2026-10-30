import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { SERVER_COMPUTED_IMMUTABLE_EXTENSION } from './utils/extensions.js';

const VALUE_ERROR_MESSAGE = `The ${SERVER_COMPUTED_IMMUTABLE_EXTENSION} extension value must be a boolean.`;
const READ_ONLY_ERROR_MESSAGE = `A property with the ${SERVER_COMPUTED_IMMUTABLE_EXTENSION} extension must also be marked as readOnly: true.`;

/**
 * IPA-131 structural validation for the x-xgen-server-computed-immutable extension.
 *
 * When the extension is present, its value must be a boolean and the carrying property must also be
 * marked as `readOnly: true`.
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
  if (!Object.keys(property).includes(SERVER_COMPUTED_IMMUTABLE_EXTENSION)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(property, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(property, path, ruleName) {
  try {
    const errors = [];
    if (typeof property[SERVER_COMPUTED_IMMUTABLE_EXTENSION] !== 'boolean') {
      errors.push({ path, message: VALUE_ERROR_MESSAGE });
    }
    if (property.readOnly !== true) {
      errors.push({ path, message: READ_ONLY_ERROR_MESSAGE });
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
