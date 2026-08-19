import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { usesComposition } from './utils/longRunningOperations.js';

const COMPOSITION_ERROR_MESSAGE =
  'OperationResponse must define its properties directly, without allOf, oneOf or anyOf composition.';

/**
 * Checks that the OperationResponse schema defined by IPA-132 is a single flat schema defining
 * every field the standard marks as always required, each listed in the schema's required array.
 * The field names are provided declaratively through the rule's functionOptions.
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
    // There is one and only one OperationResponse: a flat schema, so composition is a violation
    if (usesComposition(schema)) {
      return [{ path, message: COMPOSITION_ERROR_MESSAGE }];
    }

    const properties = schema.properties ?? {};
    const required = schema.required ?? [];
    const errors = [];

    for (const field of fields) {
      if (!properties[field]) {
        errors.push({ path, message: `OperationResponse must define the ${field} property.` });
      } else if (!required.includes(field)) {
        errors.push({
          path: [...path, 'properties', field],
          message: `The ${field} property must be listed as required.`,
        });
      }
    }

    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
