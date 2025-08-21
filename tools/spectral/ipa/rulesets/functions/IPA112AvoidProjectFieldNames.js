import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { splitCamelCase } from './utils/schemaUtils.js';

export default (input, options, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref):
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property) {
    return;
  }

  const ignoreList = options?.ignore || [];
  if (ignoreList.some((ignoreTerm) => input.toLowerCase().includes(ignoreTerm))) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, options, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(input, options, path, ruleName) {
  try {
    const prohibitedFieldNames = options?.prohibitedFieldNames || [];

    // Split the field name into words assuming camelCase
    const words = splitCamelCase(input);

    // Check if the property name includes any of the prohibited terms
    for (const prohibitedItem of prohibitedFieldNames) {
      const prohibitedName = prohibitedItem.name || '';
      const alternative = prohibitedItem.alternative || '';

      if (words.some((word) => word === prohibitedName)) {
        return [
          {
            path,
            message: `Field name "${input}" should be avoided. Consider using "${alternative}" instead.`,
          },
        ];
      }
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
