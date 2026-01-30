import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getCustomMethodName, isCustomMethodIdentifier, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

export default (input, { ignoreSingularizationList }, { path, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];

  if (!isCustomMethodIdentifier(resourcePath) && !hasCustomMethodOverride(input)) {
    return;
  }

  let methodName;
  let endpointUrl = resourcePath;

  try {
    if (isCustomMethodIdentifier(resourcePath)) {
      // Standard custom methods
      methodName = getCustomMethodName(resourcePath);
      endpointUrl = stripCustomMethodName(resourcePath);
    } else if (hasCustomMethodOverride(input)) {
      // Legacy custom methods
      methodName = input[VERB_OVERRIDE_EXTENSION].verb;
      endpointUrl = resourcePath;
    } else {
      return;
    }

    const errors = validateOperationIdAndReturnErrors(methodName, endpointUrl, input, path, ignoreSingularizationList);
    return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
};
