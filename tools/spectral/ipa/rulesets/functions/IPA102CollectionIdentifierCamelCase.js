import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';
import { isPathParam } from './utils/componentUtils.js';
import { casing } from '@stoplight/spectral-functions';

const RULE_NAME = 'xgen-IPA-102-collection-identifier-camelCase';
const ERROR_MESSAGE = 'Collection identifiers must be in camelCase.';

/**
 * Checks if collection identifiers in paths follow camelCase convention
 *
 * @param {object} input - The path key from the OpenAPI spec
 * @param {object} options - Rule configuration options
 * @param {object} context - The context object containing the path and documentInventory
 */
export default (input, options, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const pathKey = input;

  // Check for exception at the path level
  if (hasException(oas.paths[input], RULE_NAME)) {
    collectException(oas.paths[input], RULE_NAME, path);
    return;
  }

  // Extract ignored values from options
  const ignoredValues = options?.ignoredValues || [];

  const violations = checkViolations(pathKey, path, ignoredValues);
  if (violations.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, violations);
  }

  return collectAdoption(path, RULE_NAME);
};

function checkViolations(pathKey, path, ignoredValues = []) {
  const violations = [];
  try {
    // Don't filter out empty segments - they should be treated as violations
    const pathSegments = pathKey.split('/');

    // Check if there are consecutive slashes (empty segments)
    if (pathKey.includes('//')) {
      violations.push({
        message: `${ERROR_MESSAGE} Path '${pathKey}' contains double slashes (//) which is not allowed.`,
        path: [...path, pathKey],
      });
    }

    pathSegments.forEach((segment) => {
      // Skip validation for ignored values
      if (ignoredValues.includes(segment)) {
        return;
      }

      // Skip path parameter validation if it matches the expected format
      if (isPathParam(segment)) {
        // Extract parameter name without brackets
        const paramName = segment.slice(1, segment.indexOf('}'));
        // Check if it's a valid camelCase parameter name
        if (casing(paramName, { type: 'camel', disallowDigits: true })) {
          violations.push({
            message: `${ERROR_MESSAGE} Path parameter '${paramName}' in path '${pathKey}' is not in camelCase.`,
            path: [...path, pathKey],
          });
        }
        return;
      }

      // For regular path segments, check if they contain custom method indicators
      // If they do, only validate the identifier part (before the colon)
      const colonIndex = segment.indexOf(':');
      let identifier = segment;

      if (colonIndex !== -1) {
        // Only check the identifier part before the colon
        identifier = segment.substring(0, colonIndex);
      }

      // Empty identifiers (from double slashes) should be reported as violations
      if (identifier.length === 0 && segment !== '') {
        violations.push({
          message: `${ERROR_MESSAGE} Path '${pathKey}' contains an empty segment which is not valid.`,
          path: [...path, pathKey],
        });
        return;
      }

      // Skip empty segments at the beginning/end (these are not from double slashes)
      if (identifier.length === 0) {
        return;
      }

      // Skip validation for ignored values at the identifier level too
      if (ignoredValues.includes(identifier)) {
        return;
      }

      // Check if it's in camelCase using the casing function
      if (casing(identifier, { type: 'camel', disallowDigits: true })) {
        violations.push({
          message: `${ERROR_MESSAGE} Path segment '${identifier}' in path '${pathKey}' is not in camelCase.`,
          path: [...path, pathKey],
        });
      }
    });
  } catch (e) {
    handleInternalError(RULE_NAME, [...path, pathKey], e);
  }

  return violations;
}
