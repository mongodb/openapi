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
    const prohibitedFieldName = options?.prohibitedFieldName || '';
    const lowerPropertyName = input.toLowerCase();
    if (lowerPropertyName.includes(prohibitedFieldName)) {
      return [
        {
          path,
          message: `Field name "${input}" should be avoided. Consider using "group", "groups", or "groupId" instead.`,
        },
      ];
    }

    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
