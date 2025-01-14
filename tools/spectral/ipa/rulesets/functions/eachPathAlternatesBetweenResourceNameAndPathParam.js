import { isPathParam } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-102-path-alternate-resource-name-path-param';
const ERROR_MESSAGE = 'API paths must alternate between resource name and path params.';
const AUTH_PREFIX = '/api/atlas/v2';
const UNAUTH_PREFIX = '/api/atlas/v2/unauth';

const getPrefix = (path) => {
  if (path.includes(UNAUTH_PREFIX)) {
    return UNAUTH_PREFIX;
  }
  if (path.includes(AUTH_PREFIX)) {
    return AUTH_PREFIX;
  }
  return null;
};

const validatePathStructure = (elements) => {
  return elements.every((element, index) => {
    const isEvenIndex = index % 2 === 0;
    return isEvenIndex ? !isPathParam(element) : isPathParam(element);
  });
};

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  if (hasException(oas.paths[input], RULE_NAME)) {
    collectException(oas.paths[input], RULE_NAME, path);
    return;
  }

  const prefix = getPrefix(input);
  if (!prefix) {
    return;
  }

  let suffixWithLeadingSlash = input.slice(prefix.length);
  if (suffixWithLeadingSlash.length === 0) {
    return;
  }

  let suffix = suffixWithLeadingSlash.slice(1);
  let elements = suffix.split('/');
  if (!validatePathStructure(elements)) {
    return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
  }

  collectAdoption(path, RULE_NAME);
};
