import {
  getResourcePathItems,
  isReadOnlyResource,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE = 'Read-only resources must not define the Update method.';

export default (input, opts, { path, documentInventory, rule }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const ruleName = rule.name;
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (
    !isSingleResourceIdentifier(resourcePath) &&
    !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePathItems))
  ) {
    return;
  }

  if (!isReadOnlyResource(resourcePathItems)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(path, ruleName) {
  try {
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
