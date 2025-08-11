import { isPathParam } from './utils/componentUtils.js';
import { collectExceptionAdoptionViolations, handleInternalError } from './utils/collectionUtils.js';
import { AUTH_PREFIX, UNAUTH_PREFIX } from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-102-path-alternate-resource-name-path-param';
const ERROR_MESSAGE = 'API paths must alternate between resource name and path params.';

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

  const prefix = getPrefix(input);
  if (!prefix) {
    return;
  }

  let suffixWithLeadingSlash = input.slice(prefix.length);
  if (suffixWithLeadingSlash.length === 0) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(suffixWithLeadingSlash, path);

  return collectExceptionAdoptionViolations(errors, RULE_NAME, oas.paths[input], path);
};

function checkViolationsAndReturnErrors(suffixWithLeadingSlash, path) {
  try {
    let suffix = suffixWithLeadingSlash.slice(1);
    let elements = suffix.split('/');
    if (!validatePathStructure(elements)) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
