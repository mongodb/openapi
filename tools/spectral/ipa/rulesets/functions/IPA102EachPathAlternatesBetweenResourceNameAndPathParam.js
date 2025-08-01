import { isPathParam } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
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

const findExceptionInPathHierarchy = (oas, currentPath, ruleName) => {
  // Check current path first
  if (hasException(oas.paths[currentPath], ruleName)) {
    return currentPath;
  }

  // Check parent paths by removing segments from the end
  const pathSegments = currentPath.split('/').filter(segment => segment !== '');

  for (let i = pathSegments.length - 1; i > 0; i--) {
    const parentPath = '/' + pathSegments.slice(0, i).join('/');
    if (oas.paths[parentPath] && hasException(oas.paths[parentPath], ruleName)) {
      return parentPath;
    }
  }

  return null;
}

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

  const exceptionPath = findExceptionInPathHierarchy(oas, input, RULE_NAME);
  if (exceptionPath) {
    collectException(oas.paths[exceptionPath], RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(suffixWithLeadingSlash, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
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