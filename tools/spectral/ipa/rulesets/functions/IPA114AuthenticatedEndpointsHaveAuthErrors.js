import {
  evaluateAndCollectAdoptionStatus,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-114-authenticated-endpoints-have-auth-errors';

/**
 * Validates that authenticated endpoints have 401 and 403 responses defined
 *
 * Endpoints are considered authenticated unless:
 * 1. They have explicit "security: []" set
 * 2. They contain "/unauth" in the path
 *
 * @param {object} input - The operation object to check
 * @param {object} _ - Rule options (unused)
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path }) => {
  // Path components: [paths, pathName, methodName, ...]
  const pathName = path[1];

  // Skip validation if the path contains 'unauth'
  if (pathName.includes('/unauth/')) {
    return;
  }

  // Skip validation if security is explicitly set to empty array
  if (Array.isArray(input.security) && input.security.length === 0) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input.responses, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(responses, path) {
  try {
    const errors = [];

    if (!responses) {
      return [
        {
          path,
          message: `Authenticated endpoint must define a 401 and 403 responses.`,
        },
      ];
    }
    // Check for 401 Unauthorized response
    if (!responses['401']) {
      errors.push({
        path,
        message: `Authenticated endpoint must define a 401 response.`,
      });
    }

    // Check for 403 Forbidden response
    if (!responses['403']) {
      errors.push({
        path,
        message: `Authenticated endpoint must define a 403 response.`,
      });
    }

    return errors;
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
