import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { hasCustomMethodOverride, hasVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { getCustomMethodName, isCustomMethodIdentifier, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { validateOperationIdLengthAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';
import { generateOperationID } from './utils/operationIdGeneration.js';

export default (input, { ignoreSingularizationList, maxLength }, { path, rule }) => {
  const ruleName = rule.name;
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

    const expectedOperationId = generateOperationID(methodName, endpointUrl, ignoreSingularizationList);
    const errors = validateOperationIdLengthAndReturnErrors(input, path, expectedOperationId, maxLength);
    return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
};
