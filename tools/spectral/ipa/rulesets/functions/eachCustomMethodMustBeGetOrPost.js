import { isCustomMethod } from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'The HTTP method for custom methods must be GET or POST.';
const ERROR_RESULT = [{ message: ERROR_MESSAGE }];
const VALID_METHODS = ['get', 'post'];
const EXCEPTION_EXTENSION_KEY = 'x-xgen-IPA-exception';

export default (input, opts, { path }) => {
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
  let pathKey = path[1];

  if (!isCustomMethod(pathKey)) return;

  //Exclude exception extension key
  let keys = Object.keys(input);
  const httpMethods = keys.filter((key) => key !== EXCEPTION_EXTENSION_KEY);

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
