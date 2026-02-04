import {
  getResourcePathItems,
  isReadOnlyResource,
  isResetMethod,
  stripCustomMethodName,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE =
  'Read-only singleton resources must not define a :reset custom method. Read-only resources cannot be modified, so reset is not applicable.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const resourcePath = path[1];

  if (!isResetMethod(resourcePath)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(resourcePath, oas, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(resourcePath, oas, path, ruleName) {
  try {
    const baseResourcePath = stripCustomMethodName(resourcePath);
    const resourcePathItems = getResourcePathItems(baseResourcePath, oas.paths);

    if (isReadOnlyResource(resourcePathItems)) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
