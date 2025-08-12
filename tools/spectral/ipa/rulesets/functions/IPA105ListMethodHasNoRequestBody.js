import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-105-list-method-no-request-body';
const ERROR_MESSAGE = 'The List method must not include a request body.';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;

  if (
    !isResourceCollectionIdentifier(resourcePath) ||
    isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
  ) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);

  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(getOperationObject, path) {
  if (getOperationObject.requestBody) {
    return [{ path, message: ERROR_MESSAGE }];
  }
  return [];
}
