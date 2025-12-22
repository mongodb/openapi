import {
  getResourcePathItems,
  hasPatchMethod,
  hasPutMethod,
  isReadOnlyResource,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE =
  'Singleton resources should define the Update method. If this is not a singleton resource, please implement all CRUDL methods.';

export default (input, opts, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (!(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePathItems))) {
    return;
  }

  if (isReadOnlyResource(resourcePathItems)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    if (!(hasPutMethod(input) || hasPatchMethod(input))) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
