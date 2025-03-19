import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-112-avoid-project-field-names';

export default (input, options, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const property = resolveObject(oas, path);

  if (hasException(property, RULE_NAME)) {
    collectException(property, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, options, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(input, options, path) {
  try {
    const prohibitedFieldNames = options?.prohibitedFieldNames || [];
    const lowerPropertyName = input.toLowerCase();

    // Check if the property name includes any of the prohibited terms
    for (const prohibitedItem of prohibitedFieldNames) {
      const prohibitedName = prohibitedItem.name || "";
      const alternative = prohibitedItem.alternative || "";

      if (lowerPropertyName.includes(prohibitedName.toLowerCase())) {
        return [
          {
            path,
            message: `Field name "${input}" should be avoided. Consider using ${alternative.map(alt => `"${alt}"`)} instead.`,
          },
        ];
      }
    }

    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
