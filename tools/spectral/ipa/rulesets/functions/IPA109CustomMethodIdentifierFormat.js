import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-109-custom-method-identifier-format';

/**
 * Validates custom method identifiers follow the correct format pattern.
 * Custom methods should be defined using a colon character followed by the method name.
 * Valid formats: /resources/{resourceId}:customMethod or /resources:customMethod
 *
 * @param {object} input - The path string being evaluated
 * @param {object} _ - Unused
 * @param {object} context - The context object containing path and document information
 */
export default (input, _, { path }) => {
  let pathKey = path[1];

  if (!isCustomMethodIdentifier(pathKey)) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(pathKey, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(pathKey, path) {
  try {
    // Check for multiple colons
    const colonCount = (pathKey.match(/:/g) || []).length;
    if (colonCount > 1) {
      return [{ path, message: `Multiple colons found in "${pathKey}".` }];
    }

    // Check for slash before colon
    const invalidSlashBeforeColonPattern = /\/:/;

    if (invalidSlashBeforeColonPattern.test(pathKey)) {
      return [
        {
          path,
          message: `The path ${pathKey} contains a '/' before the custom method name. Custom method paths should not have a '/' before the ':'.`,
        },
      ];
    }

    // Check for invalid character before colon
    // The character before colon should be either an alphabetical character or a closing curly brace '}'
    const beforeColonMatch = pathKey.match(/([^a-zA-Z}]):/);
    if (beforeColonMatch && beforeColonMatch[1] !== '') {
      return [
        {
          path,
          message: `Invalid character '${beforeColonMatch[1]}' before colon in "${pathKey}".`,
        },
      ];
    }

    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
