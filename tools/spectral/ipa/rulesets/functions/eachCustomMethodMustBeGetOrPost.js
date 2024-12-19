import { isCustomMethod } from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-109-custom-method-must-be-GET-or-POST';
const ERROR_MESSAGE = 'The HTTP method for custom methods must be GET or POST.';
const ERROR_RESULT = [{ message: ERROR_MESSAGE }];
const VALID_METHODS = ['get', 'post'];
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export default (input, opts, { path }) => {
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
  let pathKey = path[1];

  if (!isCustomMethod(pathKey)) return;

  if (hasException(input, RULE_NAME)) {
    return;
  }

  //Extract the keys which are equivalent of the http methods
  let keys = Object.keys(input);
  const httpMethods = keys.filter((key) => HTTP_METHODS.includes(key));

  // Check for invalid methods
  if (httpMethods.some((method) => !VALID_METHODS.includes(method))) {
    return ERROR_RESULT;
  }

  // Check for multiple valid methods
  const validMethodCount = httpMethods.filter((method) => VALID_METHODS.includes(method)).length;

  if (validMethodCount > 1) {
    return ERROR_RESULT;
  }
};
