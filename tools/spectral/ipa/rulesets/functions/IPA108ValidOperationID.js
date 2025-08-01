import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectException,
  collectAndReturnViolation,
  handleInternalError,
} from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-108-valid-operation-id';

export default (input, { methodName }, { path }) => {
  const resourcePath = path[1];

  if (isCustomMethodIdentifier(resourcePath) || hasCustomMethodOverride(input)) {
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

    collectAdoption(path, RULE_NAME);
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
};
