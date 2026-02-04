import { isResetMethod } from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE = 'The :reset custom method must use the POST HTTP method.';
const VALID_METHOD = 'post';
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  // Extract the path key (e.g., '/resource/{id}/singleton:reset') from the JSONPath.
  let pathKey = path[1];

  if (!isResetMethod(pathKey)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    // Extract the keys which are equivalent of the http methods
    let keys = Object.keys(input);
    const httpMethods = keys.filter((key) => HTTP_METHODS.includes(key));

    // Check if POST is not used or if other methods are used
    if (!httpMethods.includes(VALID_METHOD)) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    // Check for multiple methods (only POST should be defined)
    if (httpMethods.length > 1) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
