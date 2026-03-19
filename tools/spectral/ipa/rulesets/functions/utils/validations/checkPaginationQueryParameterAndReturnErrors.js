import { handleInternalError } from '../collectionUtils.js';

/**
 * Checks if a list method has the required pagination query parameter with correct configuration
 *
 * @param {Object} operation - The OpenAPI operation object to check
 * @param {string[]} path - The path to the operation
 * @param {string} paramName - The name of the parameter to check ('pageNum' or 'itemsPerPage')
 * @param {{value: number}|{min?: number, max?: number}} constraint - Either `{ value: N }` for an exact match, or `{ min: N, max: N }` for a range check (min and max are both optional)
 * @param {string} ruleName - The rule name for error handling
 * @returns {Array} - Array of error objects or empty array if no errors
 */
export function checkPaginationQueryParameterAndReturnErrors(operation, path, paramName, constraint, ruleName) {
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

    if ('value' in constraint) {
      if (param.schema.default !== constraint.value) {
        return [
          {
            path,
            message: `${paramName} query parameter of List method must have a default value of ${constraint.value}.`,
          },
        ];
      }
    } else {
      if (!('min' in constraint) && !('max' in constraint)) {
        throw new Error(`constraint must have either 'value', 'min', or 'max'`);
      }
      if ('min' in constraint && param.schema.default <= constraint.min) {
        return [
          {
            path,
            message: `${paramName} query parameter of List method must have a default value greater than ${constraint.min}.`,
          },
        ];
      }
      if ('max' in constraint && param.schema.default > constraint.max) {
        return [
          {
            path,
            message: `${paramName} query parameter of List method must have a default value less than or equal to ${constraint.max}.`,
          },
        ];
      }
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
