
import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException, handleInternalError,
} from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-112-avoid-project-field-names';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const property = resolveObject(oas, path);

  if (hasException(property, RULE_NAME)) {
    collectException(property, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(input, RULE_NAME);
};

function checkViolationsAndReturnErrors(input, path) {
  const errors = [];
  try {
    const prohibitedName = "project";

    const lowerPropertyName = input.toLowerCase();

    if (lowerPropertyName.includes(prohibitedName)) {
      errors.push({
        path,
        message: `Field name "${input}" should be avoided. Consider using "group", "groups", or "groupId" instead.`
      });
    }

    return errors;
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}