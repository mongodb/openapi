import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-109-custom-method-must-be-GET-or-POST';
const ERROR_MESSAGE = 'The HTTP method for custom methods must be GET or POST.';
const VALID_METHODS = ['get', 'post'];
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

export default (input, _, { path }) => {
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
  let pathKey = path[1];

  if (!isCustomMethodIdentifier(pathKey)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(input, path) {
  try {
    //Extract the keys which are equivalent of the http methods
    let keys = Object.keys(input);
    const httpMethods = keys.filter((key) => HTTP_METHODS.includes(key));

    // Check for invalid methods
    if (httpMethods.some((method) => !VALID_METHODS.includes(method))) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    // Check for multiple valid methods
    const validMethodCount = httpMethods.filter((method) => VALID_METHODS.includes(method)).length;

    if (validMethodCount > 1) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
