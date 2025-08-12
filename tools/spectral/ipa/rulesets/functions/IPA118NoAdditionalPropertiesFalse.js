import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { findAdditionalPropertiesFalsePaths } from './utils/compareUtils.js';

const RULE_NAME = 'xgen-IPA-118-no-additional-properties-false';
const ERROR_MESSAGE = `Schema must not use 'additionalProperties: false'. Consider using 'additionalProperties: true' or omitting the property.`;
/**
 * Validates that schemas don't use additionalProperties: false
 *
 * @param {object} input - The schema object to check
 * @param {object} _ - Rule options (unused)
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const schemaObject = resolveObject(oas, path);

  const errors = checkViolationsAndReturnErrors(schemaObject, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(schemaObject, path) {
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
    handleInternalError(RULE_NAME, path, e);
  }
}
