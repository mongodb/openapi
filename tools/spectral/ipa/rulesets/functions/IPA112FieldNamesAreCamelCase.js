import { casing } from '@stoplight/spectral-functions';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-112-field-names-are-camel-case';

export default (input, options, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const property = resolveObject(oas, path);

  if (hasException(property, RULE_NAME)) {
    collectException(property, RULE_NAME, path);
    return;
  }

  if (casing(input, { type: 'camel', disallowDigits: true })) {
    const errorMessage = `Property "${input}" must use camelCase format.`;
    return collectAndReturnViolation(path, RULE_NAME, errorMessage);
  }
  collectAdoption(path, RULE_NAME);
};
