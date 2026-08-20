import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { usesComposition } from './utils/longRunningOperations.js';

/**
 * Checks that the OperationResponse schema defined by IPA-132 defines every field the standard
 * marks as conditionally present, and that none of them is listed as required: each field is
 * present only under a runtime condition that cannot be validated statically. The field names
 * and their conditions are provided declaratively through the rule's functionOptions.
 *
 * @param {object} input - The OperationResponse schema object
 * @param {object} opts - The rule's functionOptions, carrying the field names and conditions
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, opts, { path, rule }) => {
  // Composed schemas are rejected by the must-not-use-composition rule
  if (usesComposition(input)) {
    return;
  }
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, opts.fields, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(schema, fields, path, ruleName) {
  try {
    const properties = schema.properties ?? {};
    const required = schema.required ?? [];
    const errors = [];

    for (const { name, condition } of fields) {
      if (!properties[name]) {
        errors.push({ path, message: `OperationResponse must define the ${name} property.` });
      } else if (required.includes(name)) {
        errors.push({
          path: [...path, 'properties', name],
          message: `The ${name} property must not be listed as required. It is present only ${condition}, which cannot be validated statically.`,
        });
      }
    }

    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
