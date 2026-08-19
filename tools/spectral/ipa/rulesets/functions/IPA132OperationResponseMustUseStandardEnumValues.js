import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isExactEnumMatch, usesComposition } from './utils/longRunningOperations.js';

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
  // Composed schemas are rejected by the required-fields rule
  if (usesComposition(input)) {
    return;
  }
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, opts.enums, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(schema, enums, path, ruleName) {
  try {
    const properties = schema.properties ?? {};
    const errors = [];

    for (const { field, parent, values } of enums) {
      let property;
      let propertyPath;
      if (parent) {
        const parentProperty = properties[parent];
        property = parentProperty?.properties?.[field];
        propertyPath = [...path, 'properties', parent];
      } else {
        property = properties[field];
        propertyPath = [...path, 'properties', field];
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
