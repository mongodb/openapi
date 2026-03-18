import { handleInternalError } from '../collectionUtils.js';

/**
 * Checks if a list method has the required pagination query parameter with correct configuration
 *
 * @param {Object} operation - The OpenAPI operation object to check
 * @param {string[]} path - The path to the operation
 * @param {string} paramName - The name of the parameter to check ('pageNum' or 'itemsPerPage')
 * @param {number|{min: number}} defaultConstraint - The expected default value (exact match), or an object with a `min` property for a minimum value check
 * @param {string} ruleName - The rule name for error handling
 * @returns {Array} - Array of error objects or empty array if no errors
 */
export function checkPaginationQueryParameterAndReturnErrors(operation, path, paramName, defaultConstraint, ruleName) {
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

    if (typeof defaultConstraint === 'object' && defaultConstraint !== null && 'min' in defaultConstraint) {
      if (param.schema.default <= defaultConstraint.min) {
        return [
          {
            path,
            message: `${paramName} query parameter of List method must have a default value greater than ${defaultConstraint.min}.`,
          },
        ];
      }
    } else if (param.schema.default !== defaultConstraint) {
      return [
        {
          path,
          message: `${paramName} query parameter of List method must have a default value of ${defaultConstraint}.`,
        },
      ];
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
