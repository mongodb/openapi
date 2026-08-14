import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isExactEnumMatch, OPERATION_TYPE_ENUM } from './utils/longRunningOperations.js';

const CORE_METADATA_FIELDS = ['operationId', 'operationType', 'createdAt', 'updatedAt'];
const OPERATION_TYPE_ENUM_ERROR_MESSAGE = `The operationType field must use exactly the enum [${OPERATION_TYPE_ENUM.join(', ')}].`;
const CUSTOM_METHOD_MISSING_ERROR_MESSAGE =
  'OperationResponse must define a customMethod property for custom method operations.';
const CUSTOM_METHOD_REQUIRED_ERROR_MESSAGE =
  'The customMethod property must not be listed as required. It is required only when operationType is CUSTOM.';

/**
 * Checks that the OperationResponse schema defined by IPA-132 includes the stable core metadata
 * for the operation record: required operationId, operationType, createdAt and updatedAt
 * properties, the standard operationType enum, and an optional customMethod property.
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
    const properties = schema.properties ?? {};
    const required = Array.isArray(schema.required) ? schema.required : [];
    const errors = [];

    for (const field of CORE_METADATA_FIELDS) {
      if (!properties[field]) {
        errors.push({ path, message: `OperationResponse must define the ${field} property.` });
      } else if (!required.includes(field)) {
        errors.push({
          path: [...path, 'properties', field],
          message: `The ${field} property must be listed as required.`,
        });
      }
    }

    if (properties.operationType && !isExactEnumMatch(properties.operationType.enum, OPERATION_TYPE_ENUM)) {
      errors.push({ path: [...path, 'properties', 'operationType'], message: OPERATION_TYPE_ENUM_ERROR_MESSAGE });
    }

    // customMethod is required only when operationType is CUSTOM, which is a runtime condition
    // that cannot be validated statically: the property must be defined and must not be required
    if (!properties.customMethod) {
      errors.push({ path, message: CUSTOM_METHOD_MISSING_ERROR_MESSAGE });
    } else if (required.includes('customMethod')) {
      errors.push({ path: [...path, 'properties', 'customMethod'], message: CUSTOM_METHOD_REQUIRED_ERROR_MESSAGE });
    }

    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
