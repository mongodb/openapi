import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getResourcePathItems } from './utils/resourceEvaluation.js';
import { isInvalidListMethod } from './utils/methodLogic.js';
import { hasCustomMethodOverride, hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

export default (input, { methodName, ignoreSingularizationList }, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    hasCustomMethodOverride(input) ||
    hasMethodVerbOverride(input, 'get') ||
    (isInvalidListMethod(resourcePath, resourcePaths) && !hasMethodVerbOverride(input, methodName))
  ) {
    return;
  }

  if (hasMethodVerbOverride(input, methodName)) {
    methodName = input[VERB_OVERRIDE_EXTENSION].verb;
  }

  try {
    const errors = validateOperationIdAndReturnErrors(methodName, resourcePath, input, path, ignoreSingularizationList);
    return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
};
