import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getResourcePathItems } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { isInvalidGetMethod } from './utils/methodLogic.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

export default (input, { methodName, ignorePluralizationList }, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    hasCustomMethodOverride(input) ||
    hasMethodVerbOverride(input, 'list') ||
    (isInvalidGetMethod(resourcePath, resourcePaths) && !hasMethodVerbOverride(input, methodName))
  ) {
    return;
  }

  try {
    if (hasMethodVerbOverride(input, methodName)) {
      methodName = input[VERB_OVERRIDE_EXTENSION].verb;
    }
    const errors = validateOperationIdAndReturnErrors(methodName, resourcePath, input, path, ignorePluralizationList);

    return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
};
