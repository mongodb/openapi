import { isPathParam } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { AUTH_PREFIX, UNAUTH_PREFIX } from './utils/resourceEvaluation.js';
import { findExceptionInPathHierarchy } from './utils/exceptions.js';

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

const OPERATIONS_SEGMENT = 'operations';

/**
 * Removes a trailing Operations suffix (`operations` or `operations/{operationId}`) so the rest of
 * the path can be checked for strict alternation. The Operations collection defined by IPA-132 is
 * nested directly under its parent resource and intentionally does not alternate.
 *
 * @param {string[]} elements - The path segments
 * @returns {string[]} The path segments without a trailing Operations suffix
 */
const stripOperationsSuffix = (elements) => {
  const last = elements[elements.length - 1];
  const secondToLast = elements[elements.length - 2];

  let suffixLength;
  if (secondToLast === OPERATIONS_SEGMENT && isPathParam(last)) {
    suffixLength = 2; // `.../operations/{operationId}`
  } else if (last === OPERATIONS_SEGMENT) {
    suffixLength = 1; // `.../operations`
  } else {
    return elements;
  }

  // An unscoped `/api/atlas/v2/operations` strips to nothing and passes; rejecting it is IPA-132's job.
  return elements.slice(0, elements.length - suffixLength);
};

const validatePathStructure = (elements) => {
  return stripOperationsSuffix(elements).every((element, index) => {
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
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  const prefix = getPrefix(input);
  if (!prefix) {
    return;
  }

  let suffixWithLeadingSlash = input.slice(prefix.length);
  if (suffixWithLeadingSlash.length === 0) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(suffixWithLeadingSlash, path, ruleName);

  // Check for exceptions in path hierarchy
  const result = findExceptionInPathHierarchy(oas, input, ruleName, path);
  if (result?.error) {
    return result.error;
  }

  const objectToCheckForException = result ? oas.paths[result.parentPath] : oas.paths[input];

  return evaluateAndCollectAdoptionStatus(errors, ruleName, objectToCheckForException, path);
};

function checkViolationsAndReturnErrors(suffixWithLeadingSlash, path, ruleName) {
  try {
    let suffix = suffixWithLeadingSlash.slice(1);
    let elements = suffix.split('/');
    if (!validatePathStructure(elements)) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
