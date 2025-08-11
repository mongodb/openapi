import { collectExceptionAdoptionViolations, handleInternalError } from './utils/collectionUtils.js';
import { getResourcePathItems } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { isInvalidGetMethod } from './utils/methodLogic.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-104-valid-operation-id';

export default (input, { methodName }, { path, documentInventory }) => {
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
    const errors = validateOperationIdAndReturnErrors(methodName, resourcePath, input, path);

    return collectExceptionAdoptionViolations(errors, RULE_NAME, input, path);
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
};
