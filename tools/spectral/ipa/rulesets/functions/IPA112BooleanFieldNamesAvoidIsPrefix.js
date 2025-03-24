import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-112-boolean-field-names-avoid-is-prefix';
const IS_PREFIX_REGEX = /^is[A-Z]/;

export default (input, options, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const property = resolveObject(oas, path);

  if (hasException(property, RULE_NAME)) {
    collectException(property, RULE_NAME, path);
    return;
  }

  if (property.type === 'boolean') {
    if (IS_PREFIX_REGEX.test(input)) {
      const suggestedName = input.charAt(2).toLowerCase() + input.slice(3);
      const errorMessage = `Boolean field "${input}" should not use the "is" prefix. Use "${suggestedName}" instead.`;
      return collectAndReturnViolation(path, RULE_NAME, errorMessage);
    }
  }

  collectAdoption(path, RULE_NAME);
};
