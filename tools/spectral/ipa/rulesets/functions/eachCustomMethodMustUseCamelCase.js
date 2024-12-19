import { getCustomMethod, isCustomMethod } from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import { casing } from '@stoplight/spectral-functions';

const RULE_NAME = 'xgen-IPA-109-custom-method-must-use-camel-case';
const ERROR_MESSAGE = 'The custom method must use camelCase format.';
const ERROR_RESULT = [{ message: ERROR_MESSAGE }];

export default (input, opts, { path }) => {
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
  let pathKey = path[1];

  if (!isCustomMethod(pathKey)) return;

  if (hasException(input, RULE_NAME)) {
    return;
  }

  let methodName = getCustomMethod(pathKey);
  if (!methodName) {
    return;
  }

  const isCamelCase = casing(methodName, { type: 'camel', disallowDigits: true });
  if (isCamelCase !== undefined) {
    return ERROR_RESULT;
  }
};
