import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getMergedProperties, getMergedRequired, getPropertyPath } from './utils/longRunningOperations.js';

/**
 * Checks that the OperationResponse schema defined by IPA-132 defines every field the standard
 * marks as always required, and lists each of them in the schema's required array. The field
 * names are provided declaratively through the rule's functionOptions.
 *
 * @param {object} input - The OperationResponse schema object
 * @param {object} opts - The rule's functionOptions, carrying the required field names
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, opts, { path, rule }) => {
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, opts.fields, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(schema, fields, path, ruleName) {
  try {
    // Properties and required lists may be spread across allOf sub-schemas
    const properties = getMergedProperties(schema);
    const required = getMergedRequired(schema);
    const errors = [];

    for (const field of fields) {
      if (!properties[field]) {
        errors.push({ path, message: `OperationResponse must define the ${field} property.` });
      } else if (!required.includes(field)) {
        // Anchor at the property's actual location, which may sit inside an allOf sub-schema
        errors.push({
          path: [...path, ...getPropertyPath(schema, field)],
          message: `The ${field} property must be listed as required.`,
        });
      }
    }

    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
