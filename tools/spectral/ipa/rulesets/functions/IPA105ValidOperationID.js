import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { getResourcePathItems } from './utils/resourceEvaluation.js';
import { isInvalidListMethod } from './utils/methodLogic.js';
import { hasCustomMethodOverride, hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-105-valid-operation-id';

export default (input, { methodName }, { path, documentInventory }) => {
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

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  if (hasMethodVerbOverride(input, methodName)) {
    methodName = input[VERB_OVERRIDE_EXTENSION].verb;
  }

  try {
    const errors = validateOperationIdAndReturnErrors(methodName, resourcePath, input, path);

    if (errors.length > 0) {
      return collectAndReturnViolation(path, RULE_NAME, errors);
    }

    return collectAdoption(path, RULE_NAME);
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
};
