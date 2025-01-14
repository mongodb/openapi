import { getCustomMethodName, isCustomMethod } from './utils/resourceEvaluation.js';
import { collectException, hasException } from './utils/exceptions.js';
import { casing } from '@stoplight/spectral-functions';
import {
  collectAdoption,
  collectAndReturnViolation,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-109-custom-method-must-use-camel-case';

export default (input, opts, { path }) => {
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
  let pathKey = path[1];

  if (!isCustomMethod(pathKey)) return;

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  let methodName = getCustomMethodName(pathKey);
  if (methodName.length === 0 || methodName.trim().length === 0) {
    const errorMessage = 'Custom method name cannot be empty or blank.';
    return collectAndReturnViolation(path, RULE_NAME, errorMessage);
  }

  if (casing(methodName, { type: 'camel', disallowDigits: true })) {
    const errorMessage = `${methodName} must use camelCase format.`;
    return collectAndReturnViolation(path, RULE_NAME, errorMessage);
  }

  collectAdoption(path, RULE_NAME);
};
