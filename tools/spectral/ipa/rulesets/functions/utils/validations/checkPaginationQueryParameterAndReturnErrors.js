import { handleInternalError } from '../collectionUtils.js';

/**
 * Checks if a list method has the required pagination query parameter with correct configuration
 *
 * @param {Object} operation - The OpenAPI operation object to check
 * @param {string[]} path - The path to the operation
 * @param {string} paramName - The name of the parameter to check ('pageNum' or 'itemsPerPage')
 * @param {number} defaultValue - The expected default value (1 for pageNum, 100 for itemsPerPage)
 * @param {string} ruleName - The rule name for error handling
 * @returns {Array} - Array of error objects or empty array if no errors
 */
export function checkPaginationQueryParameterAndReturnErrors(operation, path, paramName, defaultValue, ruleName) {
  try {
    const parameters = operation.parameters;

    if (!parameters) {
      return [
        {
          path,
          message: `List method is missing query parameters.`,
        },
      ];
    }

    const param = parameters.find(
      (p) => p.name === paramName && p.in === 'query' && p.schema && p.schema.type === 'integer'
    );

    if (!param) {
      return [
        {
          path,
          message: `List method is missing a ${paramName} query parameter.`,
        },
      ];
    }

    if (param.required === true) {
      return [
        {
          path,
          message: `${paramName} query parameter of List method must not be required.`,
        },
      ];
    }

    if (param.schema.default === undefined) {
      return [
        {
          path,
          message: `${paramName} query parameter of List method must have a default value defined.`,
        },
      ];
    }

    if (param.schema.default !== defaultValue) {
      return [
        {
          path,
          message: `${paramName} query parameter of List method must have a default value of ${defaultValue}.`,
        },
      ];
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
