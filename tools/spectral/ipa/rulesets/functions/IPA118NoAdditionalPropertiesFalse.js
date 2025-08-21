import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { findAdditionalPropertiesFalsePaths } from './utils/compareUtils.js';

const ERROR_MESSAGE = `Schema must not use 'additionalProperties: false'. Consider using 'additionalProperties: true' or omitting the property.`;
/**
 * Validates that schemas don't use additionalProperties: false
 *
 * @param {object} input - The schema object to check
 * @param {object} _ - Rule options (unused)
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const schemaObject = resolveObject(oas, path);

  const errors = checkViolationsAndReturnErrors(schemaObject, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(schemaObject, path, ruleName) {
  try {
    const errors = [];

    const results = findAdditionalPropertiesFalsePaths(schemaObject, path);
    for (const resultPath of results) {
      errors.push({
        message: ERROR_MESSAGE,
        path: resultPath,
      });
    }

    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
