import {
  getResourcePathItems,
  isResetMethod,
  isResourceCollectionIdentifier,
  isSingletonResource,
  stripCustomMethodName,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE = 'The :reset custom method must only be defined on singleton resources.';

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
    // Get the base resource path (without :reset)
    const baseResourcePath = stripCustomMethodName(resourcePath);
    const resourcePathItems = getResourcePathItems(baseResourcePath, oas.paths);

    // Check if the base resource is a singleton
    if (!(isResourceCollectionIdentifier(baseResourcePath) && isSingletonResource(resourcePathItems))) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
