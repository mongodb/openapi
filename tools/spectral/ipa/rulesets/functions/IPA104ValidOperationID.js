import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';
import { getResourcePathItems, isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, hasMethodVerbOverride } from './utils/extensions.js';
import { isInvalidGetMethod } from './utils/methodLogic.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-104-valid-operation-id';

export default (input, { methodName }, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    hasCustomMethodOverride(input) ||
    isCustomMethodIdentifier(resourcePath) ||
    hasMethodVerbOverride(input, 'list') ||
    (isInvalidGetMethod(resourcePath, resourcePaths) && !hasMethodVerbOverride(input, methodName))
  ) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
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
