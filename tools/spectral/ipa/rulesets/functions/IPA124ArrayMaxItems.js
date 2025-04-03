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
export default (input, { maxItems }, { path }) => {
  console.log(input);
  console.log(path);
  // Check for exception at the schema level
  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
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
    // Check if maxItems is set to the required value
    else if (input.maxItems !== maxItems) {
      return [
        {
          message: `Array maxItems must be set to ${maxItems}, found: ${input.maxItems}.`,
          path,
        },
      ];
    }

    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
