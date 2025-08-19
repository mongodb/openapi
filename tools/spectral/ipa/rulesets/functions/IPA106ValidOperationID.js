import { handleInternalError, evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-106-valid-operation-id';

export default (input, { methodName, ignorePluralizationList }, { path }) => {
  const resourcePath = path[1];

  if (hasCustomMethodOverride(input) || isCustomMethodIdentifier(resourcePath)) {
    return;
  }

  if (hasMethodVerbOverride(input, methodName)) {
    methodName = input[VERB_OVERRIDE_EXTENSION].verb;
  }

  try {
    const errors = validateOperationIdAndReturnErrors(methodName, resourcePath, input, path, ignorePluralizationList);
    return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
};
