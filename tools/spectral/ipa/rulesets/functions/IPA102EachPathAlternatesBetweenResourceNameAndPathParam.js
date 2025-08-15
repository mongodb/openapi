import { isPathParam } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { AUTH_PREFIX, UNAUTH_PREFIX } from './utils/resourceEvaluation.js';
import { findExceptionInPathHierarchy } from './utils/exceptions.js';

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

/**
 * Checks if the resource identifier components alternate between collection identifiers and resourceIDs
 *
 * The function checks the entire path hierarchy. If any parent path has an exception, the exception will be inherited.
 *
 * @param {object} input - The path key from the OpenAPI spec
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path and documentInventory
 */
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

  // Check for exceptions in path hierarchy
  const result = findExceptionInPathHierarchy(oas, input, RULE_NAME, path);
  if (result?.error) {
    return result.error;
  }

  const objectToCheckForException = result ? oas.paths[result.parentPath] : oas.paths[input];

  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, objectToCheckForException, path);
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
