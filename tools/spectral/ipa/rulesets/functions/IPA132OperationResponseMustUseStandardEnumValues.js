import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getMergedProperties, getPropertyPath, isExactEnumMatch } from './utils/longRunningOperations.js';

/**
 * Checks that every enum field of the OperationResponse schema defined by IPA-132 uses exactly
 * the standard enum values, in any order. The field names and expected values are provided
 * declaratively through the rule's functionOptions. Fields that are not defined are skipped:
 * their presence is validated by the required-fields and optional-fields rules.
 *
 * @param {object} input - The OperationResponse schema object
 * @param {object} opts - The rule's functionOptions, carrying the enum fields and their values
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, opts, { path, rule }) => {
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, opts.enums, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(schema, enums, path, ruleName) {
  try {
    // Properties may be spread across allOf sub-schemas
    const properties = getMergedProperties(schema);
    const errors = [];

    for (const { field, parent, values } of enums) {
      let property;
      let propertyPath;
      if (parent) {
        const parentProperty = properties[parent];
        property = parentProperty ? getMergedProperties(parentProperty)[field] : undefined;
        // Anchor at the parent property's actual location, which may sit inside an allOf sub-schema
        propertyPath = [...path, ...(getPropertyPath(schema, parent) ?? [])];
      } else {
        property = properties[field];
        propertyPath = [...path, ...(getPropertyPath(schema, field) ?? [])];
      }

      // Absent fields are the required-fields and optional-fields rules' concern
      if (!property) {
        continue;
      }
      if (!isExactEnumMatch(property.enum, values)) {
        errors.push({
          path: propertyPath,
          message: `The ${field} field must use exactly the enum [${values.join(', ')}].`,
        });
      }
    }

    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
