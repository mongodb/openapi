import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';

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
export default (input, _, { path }) => {
  const violations = [];

  Object.keys(input).forEach((pathKey) => {
    // Check for exception at the path level
    if (input[pathKey] && hasException(input[pathKey], RULE_NAME)) {
      collectException(input[pathKey], RULE_NAME, [...path, pathKey]);
      return;
    }

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
  });

  if (violations.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, violations);
  }

  return collectAdoption(path, RULE_NAME);
};
