import { casing } from '@stoplight/spectral-functions';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-112-field-names-are-camel-case';

export default (input, options, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref):
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property) {
    return;
  }

  if (hasException(property, RULE_NAME)) {
    collectException(property, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(input, path) {
  try {
    if (casing(input, { type: 'camel', disallowDigits: true })) {
      const errorMessage = `Property "${input}" must use camelCase format.`;
      return [{ path, message: errorMessage }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
