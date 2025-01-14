import { isCustomMethod } from './utils/resourceEvaluation.js';
import { collectException, hasException } from './utils/exceptions.js';
import collector, { EntryType } from '../../metrics/collector.js';

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
    collectException(input, RULE_NAME, path);
    return;
  }

  //Extract the keys which are equivalent of the http methods
  let keys = Object.keys(input);
  const httpMethods = keys.filter((key) => HTTP_METHODS.includes(key));

  // Check for invalid methods
  if (httpMethods.some((method) => !VALID_METHODS.includes(method))) {
    collector.add(EntryType.VIOLATION, path, RULE_NAME);
    return ERROR_RESULT;
  }

  // Check for multiple valid methods
  const validMethodCount = httpMethods.filter((method) => VALID_METHODS.includes(method)).length;

  if (validMethodCount > 1) {
    collector.add(EntryType.VIOLATION, path, RULE_NAME);
    return ERROR_RESULT;
  }

  collector.add(EntryType.ADOPTION, path, RULE_NAME);
};
