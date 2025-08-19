import { handleInternalError, evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-108-valid-operation-id';

export default (input, { methodName, ignoreList }, { path }) => {
  const resourcePath = path[1];

  if (isCustomMethodIdentifier(resourcePath) || hasCustomMethodOverride(input)) {
    return;
  }

  if (hasMethodVerbOverride(input, methodName)) {
    methodName = input[VERB_OVERRIDE_EXTENSION].verb;
  }

  try {
    const errors = validateOperationIdAndReturnErrors(methodName, resourcePath, input, path, ignoreList);
    return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
};
