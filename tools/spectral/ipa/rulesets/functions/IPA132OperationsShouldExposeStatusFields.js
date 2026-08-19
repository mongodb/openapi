import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getMergedProperties } from './utils/longRunningOperations.js';

const STATUS_FIELDS = ['statusMessage', 'progress', 'estimatedCompletionTime'];
const PROGRESS_FIELDS = ['completed', 'total', 'unit'];

/**
 * Checks that the OperationResponse schema defined by IPA-132 exposes the optional progress
 * fields statusMessage, progress and estimatedCompletionTime, so clients can reason about
 * in-flight work.
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
    // Properties may be spread across allOf sub-schemas
    const properties = getMergedProperties(schema);
    const errors = [];
    for (const field of STATUS_FIELDS) {
      if (!properties[field]) {
        errors.push({ path, message: `OperationResponse should define a ${field} property.` });
      }
    }

    if (properties.progress) {
      const progressProperties = getMergedProperties(properties.progress);
      for (const field of PROGRESS_FIELDS) {
        if (!progressProperties[field]) {
          errors.push({
            path: [...path, 'properties', 'progress'],
            message: `The progress object should define a ${field} property.`,
          });
        }
      }
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
