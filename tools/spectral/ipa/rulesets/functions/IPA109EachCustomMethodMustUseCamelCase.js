import { getCustomMethodName, isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { casing } from '@stoplight/spectral-functions';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

export default (input, opts, { path, rule }) => {
  const ruleName = rule.name;
  // Extract the path key (e.g., '/a/{exampleId}:method') from the JSONPath.
  let pathKey = path[1];

  if (!isCustomMethodIdentifier(pathKey)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(pathKey, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(pathKey, path, ruleName) {
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
    return handleInternalError(ruleName, path, e);
  }
}
