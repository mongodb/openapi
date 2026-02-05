import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isResetMethod, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { validateOperationIdAndReturnErrors } from './utils/validations/validateOperationIdAndReturnErrors.js';

export default (input, { ignoreSingularizationList }, { path, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];

  if (!isResetMethod(resourcePath)) {
    return;
  }

  try {
    const methodName = 'reset';
    const endpointUrl = stripCustomMethodName(resourcePath);
    const errors = validateOperationIdAndReturnErrors(methodName, endpointUrl, input, path, ignoreSingularizationList);
    return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
};
