import { handleInternalError, evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, VERB_OVERRIDE_EXTENSION, hasVerbOverride } from './utils/extensions.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-109-valid-operation-id';

export default (input, _, { path }) => {
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
    } else if (hasVerbOverride(input)) {
      // Legacy custom methods
      methodName = input[VERB_OVERRIDE_EXTENSION].verb;
      endpointUrl = resourcePath;
    } else {
      return;
    }

    const errors = validateOperationIdAndReturnErrors(methodName, endpointUrl, input, path);
    return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
};
