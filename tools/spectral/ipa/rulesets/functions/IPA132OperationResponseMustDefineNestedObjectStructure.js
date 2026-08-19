import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { usesComposition } from './utils/longRunningOperations.js';

/**
 * Checks that every nested object field of the OperationResponse schema defined by IPA-132
 * defines the properties the standard requires of it. The object fields and their properties are
 * provided declaratively through the rule's functionOptions. Fields that are not defined are
 * skipped: their presence is validated by the optional-fields rule.
 *
 * @param {object} input - The OperationResponse schema object
 * @param {object} opts - The rule's functionOptions, carrying the object fields and their properties
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, opts, { path, rule }) => {
  // Composed schemas are rejected by the required-fields rule
  if (usesComposition(input)) {
    return;
  }
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, opts.objects, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(schema, objects, path, ruleName) {
  try {
    const schemaProperties = schema.properties ?? {};
    const errors = [];

    for (const { field, properties } of objects) {
      const objectSchema = schemaProperties[field];
      // Absent fields are the optional-fields rule's concern
      if (!objectSchema) {
        continue;
      }

      const objectProperties = objectSchema.properties ?? {};
      for (const property of properties) {
        if (!objectProperties[property]) {
          errors.push({
            path: [...path, 'properties', field],
            message: `The ${field} object must define a ${property} property.`,
          });
        }
      }
    }

    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
