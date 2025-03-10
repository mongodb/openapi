import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-102-collection-identifier-camelCase';
const ERROR_MESSAGE = 'Collection identifiers must be in camelCase.';

/**
 * Checks if a string is in camelCase format
 * 
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is in camelCase, false otherwise
 */
function isCamelCase(str) {
  // Must start with lowercase letter
  if (!/^[a-z]/.test(str)) {
    return false;
  }
  
  // Should not contain underscores or hyphens
  if (/[-_]/.test(str)) {
    return false;
  }
  
  // Should not have consecutive uppercase letters (not typical in camelCase)
  if (/[A-Z]{2,}/.test(str)) {
    return false;
  }
  
  return true;
}

/**
 * Checks if collection identifiers in paths follow camelCase convention
 *
 * @param {object} input - The paths object from the OpenAPI spec
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path
 */
export default (input, _, { path }) => {
  const violations = [];
  
  Object.keys(input).forEach(pathKey => {
    // Check for exception at the path level
    if (input[pathKey] && hasException(input[pathKey], RULE_NAME)) {
      collectException(input[pathKey], RULE_NAME, [...path, pathKey]);
      return;
    }
    
    const pathSegments = pathKey.split('/').filter(segment => segment.length > 0);
    
    pathSegments.forEach(segment => {
      // Skip path parameters
      if (segment.startsWith('{') && segment.endsWith('}')) {
        return;
      }
      
      // Check for custom methods
      const parts = segment.split(':');
      const identifier = parts[0];
      
      // Skip empty identifiers
      if (identifier.length === 0) {
        return;
      }
      
      // Check if it's in camelCase
      if (!isCamelCase(identifier)) {
        violations.push({
          message: `${ERROR_MESSAGE} Path segment '${identifier}' in path '${pathKey}' is not in camelCase.`,
          path: [...path, pathKey]
        });
      }
      
      // If there's a custom method, check that too
      if (parts.length > 1 && parts[1].length > 0) {
        const methodName = parts[1];
        if (!isCamelCase(methodName)) {
          violations.push({
            message: `${ERROR_MESSAGE} Custom method '${methodName}' in path '${pathKey}' is not in camelCase.`,
            path: [...path, pathKey]
          });
        }
      }
    });
  });
  
  if (violations.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, violations);
  }
  
  return collectAdoption(path, RULE_NAME);
};
