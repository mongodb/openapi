import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'The Get method must not include a request body.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const oas = documentInventory.resolved;

  if (
    !isSingleResourceIdentifier(resourcePath) &&
    !(
      isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
    )
  ) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);

  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(getOperationObject, path) {
  if (getOperationObject.requestBody) {
    return [{ path, message: ERROR_MESSAGE }];
  }
  return [];
}
