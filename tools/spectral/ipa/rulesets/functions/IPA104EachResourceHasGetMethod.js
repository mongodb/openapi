import {
  getResourcePathItems,
  hasGetMethod,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE = 'APIs must provide a get method for resources.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  if (!isResourceCollectionIdentifier(input)) {
    return;
  }

  const oas = documentInventory.resolved;

  const errors = checkViolationsAndReturnErrors(oas.paths, input, path, ruleName);

  return evaluateAndCollectAdoptionStatus(errors, ruleName, oas.paths[input], path);
};

function checkViolationsAndReturnErrors(oasPaths, input, path, ruleName) {
  try {
    const resourcePathItems = getResourcePathItems(input, oasPaths);
    const resourcePaths = Object.keys(resourcePathItems);

    if (isSingletonResource(resourcePathItems)) {
      if (!hasGetMethod(resourcePathItems[resourcePaths[0]])) {
        return [{ path, message: ERROR_MESSAGE }];
      }
    } else {
      if (resourcePaths.length === 1) {
        return [{ path, message: ERROR_MESSAGE }];
      }
      const singleResourcePath = resourcePaths.find((p) => isSingleResourceIdentifier(p));
      if (!singleResourcePath || !hasGetMethod(resourcePathItems[singleResourcePath])) {
        return [{ path, message: ERROR_MESSAGE }];
      }
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
