import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { usesComposition } from './utils/longRunningOperations.js';

/**
 * Checks that the OperationResponse schema defined by IPA-132 exposes the optional progress
 * fields statusMessage, progress and estimatedCompletionTime, so clients can reason about
 * in-flight work. The field names and nested object structures are provided declaratively
 * through the rule's functionOptions.
 *
 * @param {object} input - The OperationResponse schema object
 * @param {object} opts - The rule's functionOptions, carrying the field names and nested objects
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, opts, { path, rule }) => {
  // Composed schemas are rejected by the required-fields rule
  if (usesComposition(input)) {
    return;
  }
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, opts, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(schema, { fields, objects }, path, ruleName) {
  try {
    const properties = schema.properties ?? {};
    const errors = [];
    for (const field of fields) {
      if (!properties[field]) {
        errors.push({ path, message: `OperationResponse should define the ${field} property.` });
      }
    }

    for (const { field, properties: objectFields } of objects) {
      const objectSchema = properties[field];
      if (!objectSchema) {
        continue;
      }
      const objectProperties = objectSchema.properties ?? {};
      for (const objectField of objectFields) {
        if (!objectProperties[objectField]) {
          errors.push({
            path: [...path, 'properties', field],
            message: `The ${field} object should define the ${objectField} property.`,
          });
        }
      }
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
