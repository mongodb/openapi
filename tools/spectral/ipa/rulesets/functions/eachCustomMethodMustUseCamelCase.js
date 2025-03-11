import { getCustomMethodName, isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import { casing } from '@stoplight/spectral-functions';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-109-custom-method-must-use-camel-case';

export default (input, opts, { path }) => {
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
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
    let methodName = getCustomMethodName(pathKey);
    if (methodName.length === 0 || methodName.trim().length === 0) {
      const errorMessage = 'Custom method name cannot be empty or blank.';
      return [{ path, message: errorMessage }];
    }

    if (casing(methodName, { type: 'camel', disallowDigits: true })) {
      const errorMessage = `${methodName} must use camelCase format.`;
      return [{ path, message: errorMessage }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
