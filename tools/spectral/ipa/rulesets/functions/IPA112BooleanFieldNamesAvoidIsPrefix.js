import {
  evaluateAndCollectAdoptionStatus,
  evaluateAndCollectAdoptionStatusWithInheritedException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { findExceptionInParentSchema, getUnnecessarySchemaExceptionError } from './utils/exceptions.js';

const IS_PREFIX_REGEX = /^is[A-Z]/;

/**
 * Checks that boolean field names do not use the "is" prefix
 *
 * The exception can be set on the field or on the schema containing the field. An exception on the schema
 * applies to all fields defined directly on that schema and is reported as unnecessary when no field needs it.
 *
 * @param {string} input - The field name
 * @param {object} options - Rule configuration options
 * @param {object} context - The context object containing the path and documentInventory
 */
export default (input, options, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  if (!property) {
    return;
  }

  const result = findExceptionInParentSchema(oas, property, path, ruleName);

  // A schema-level exception is unnecessary if no field defined directly on the schema needs it.
  // Every field of the schema reports the same error, which Spectral deduplicates into a single result.
  const unnecessarySchemaException =
    result?.schema && !schemaNeedsException(result.schema)
      ? getUnnecessarySchemaExceptionError(path.slice(0, -2), ruleName)
      : undefined;

  // Skip schema references ($ref) and non-boolean fields: referenced schemas are validated
  // separately to prevent duplicate violations. The schema-level exception is still checked
  // for non-boolean fields, since it applies to the whole schema.
  if (property.type !== 'boolean') {
    return unnecessarySchemaException;
  }

  if (result?.error) {
    return result.error;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  if (!result) {
    return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
  }

  const inheritedResult = evaluateAndCollectAdoptionStatusWithInheritedException(errors, ruleName, result.schema, path);
  return unnecessarySchemaException ?? inheritedResult;
};

/**
 * Checks whether the schema-level exception is needed by at least one field defined directly on the schema.
 * A field needs the exception if it is a boolean field using the "is" prefix.
 *
 * @param {object} schema - The schema containing the exception
 * @returns {boolean} true if at least one field of the schema violates the rule, false otherwise
 */
function schemaNeedsException(schema) {
  return Object.entries(schema.properties ?? {}).some(
    ([fieldName, fieldSchema]) => fieldSchema?.type === 'boolean' && IS_PREFIX_REGEX.test(fieldName)
  );
}

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    if (IS_PREFIX_REGEX.test(input)) {
      const suggestedName = input.charAt(2).toLowerCase() + input.slice(3);
      const errorMessage = `Boolean field "${input}" should not use the "is" prefix. Use "${suggestedName}" instead.`;
      return [{ path, message: errorMessage }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
