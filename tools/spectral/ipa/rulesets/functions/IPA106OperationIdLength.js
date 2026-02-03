import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { hasCustomMethodOverride, hasMethodVerbOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { validateOperationIdLengthAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';
import { generateOperationID } from './utils/operationIdGeneration.js';

export default (input, { methodName, ignoreSingularizationList, maxLength }, { path, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];

  if (hasCustomMethodOverride(input) || isCustomMethodIdentifier(resourcePath)) {
    return;
  }

  if (hasMethodVerbOverride(input, methodName)) {
    methodName = input[VERB_OVERRIDE_EXTENSION].verb;
  }

  try {
    const expectedOperationId = generateOperationID(methodName, resourcePath, ignoreSingularizationList);
    const errors = validateOperationIdLengthAndReturnErrors(input, path, expectedOperationId, maxLength);
    return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
};
