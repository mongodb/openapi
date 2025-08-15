import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { findExceptionInPathHierarchy } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-102-collection-identifier-pattern';
const ERROR_MESSAGE =
  'Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers (/[a-z][a-zA-Z0-9]*/).';
const VALID_IDENTIFIER_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

/**
 * Checks if collection identifiers in paths begin with a lowercase letter and contain only ASCII letters and numbers
 *
 * @param {object} input - The paths object from the OpenAPI spec
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;

  const violations = checkViolations(input, path);

  // Check for exceptions in path hierarchy
  const pathWithException = findExceptionInPathHierarchy(oas, input, RULE_NAME);
  const objectToCheck = pathWithException ? oas.paths[pathWithException] : oas.paths[input];

  return evaluateAndCollectAdoptionStatus(violations, RULE_NAME, objectToCheck, path);
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
