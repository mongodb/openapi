import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectException,
  collectAndReturnViolation,
  handleInternalError,
} from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride, VERB_OVERRIDE_EXTENSION, hasVerbOverride } from './utils/extensions.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-109-valid-operation-id';

export default (input, _, { path }) => {
  const resourcePath = path[1];

  if (!isCustomMethodIdentifier(resourcePath) && !hasCustomMethodOverride(input)) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
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

    if (errors.length !== 0) {
      return collectAndReturnViolation(path, RULE_NAME, errors);
    }

    collectAdoption(path, RULE_NAME);
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
};
