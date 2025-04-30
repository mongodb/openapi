import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-124-array-max-items';

/**
 * Checks if array fields have maxItems defined and set to 100
 *
 * @param {object} input - The array schema object from the OpenAPI spec
 * @param {object} options - Rule configuration options
 * @param {object} context - The context object containing the path and documentInventory
 */
export default (input, { maxItems, ignore = [] }, { path }) => {
  // Check for exception at the schema level
  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  let propertyName;
  if (path.includes('parameters')) {
    propertyName = input.name;
  } else if (path.includes('content')) {
    propertyName = null;
  } else {
    propertyName = path[path.length - 1];
  }

  // Check if the parameter name is in the ignore list
  if (ignore.includes(propertyName)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, maxItems);
  if (errors.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(input, path, maxItems) {
  try {
    // Check if maxItems is defined
    if (input.maxItems === undefined) {
      return [
        {
          message: `Array must have maxItems property defined to enforce an upper bound on the number of items.`,
          path,
        },
      ];
    }
    // Check if maxItems is larger than the recommended value
    else if (input.maxItems > maxItems) {
      return [
        {
          message: `The maxItems value for arrays must be set to ${maxItems} or below, found: ${input.maxItems}. If the array field has the chance of being too large, the API should use a sub-resource instead.`,
          path,
        },
      ];
    }

    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
