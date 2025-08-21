import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { findExceptionInPathHierarchy } from './utils/exceptions.js';

const ERROR_MESSAGE =
  'Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers (/[a-z][a-zA-Z0-9]*/).';
const VALID_IDENTIFIER_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

/**
 * Checks if collection identifiers in paths begin with a lowercase letter and contain only ASCII letters and numbers
 *
 * The function checks the entire path hierarchy. If any parent path has an exception, the exception will be inherited.
 *
 * @param {object} input - The paths object from the OpenAPI spec
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path and documentInventory
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  const violations = checkViolations(input, path);

  // Check for exceptions in path hierarchy
  const result = findExceptionInPathHierarchy(oas, input, ruleName, path);
  if (result?.error) {
    return result.error;
  }
  const objectToCheckForException = result ? oas.paths[result.parentPath] : oas.paths[input];

  return evaluateAndCollectAdoptionStatus(violations, ruleName, objectToCheckForException, path);
};

function checkViolations(pathKey, path) {
  const violations = [];
  // Skip path parameters and custom methods
  const pathSegments = pathKey.split('/').filter((segment) => segment.length > 0);

  pathSegments.forEach((segment) => {
    // Skip path parameters (those inside curly braces)
    if (segment.startsWith('{') && segment.endsWith('}')) {
      return;
    }

    // Skip segments with custom methods (containing :)
    if (segment.includes(':')) {
      return;
    }

    // Check the pattern
    if (!VALID_IDENTIFIER_PATTERN.test(segment)) {
      violations.push({
        message: `${ERROR_MESSAGE} Path segment '${segment}' in path '${pathKey}' doesn't match the required pattern.`,
        path: [...path, pathKey],
      });
    }
  });
  return violations;
}
