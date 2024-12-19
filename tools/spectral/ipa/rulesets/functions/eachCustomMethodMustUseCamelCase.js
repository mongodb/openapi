import { getCustomMethodName, isCustomMethod } from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import { casing } from '@stoplight/spectral-functions';

const RULE_NAME = 'xgen-IPA-109-custom-method-must-use-camel-case';
const ERROR_MESSAGE = 'The custom method name must use camelCase format.';

export default (input, opts, { path }) => {
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
  let pathKey = path[1];

  if (!isCustomMethod(pathKey)) return;

  if (hasException(input, RULE_NAME)) {
    return;
  }

  let methodName = getCustomMethodName(pathKey);
  if (methodName.length === 0 || methodName.trim().length === 0) {
    return [{ message: 'Custom method name cannot be empty or blank.' }];
  }

  if (casing(methodName, { type: 'camel', disallowDigits: true })) {
    return [{ message: `${ERROR_MESSAGE} Method name: ${methodName}.` }];
  }
};
