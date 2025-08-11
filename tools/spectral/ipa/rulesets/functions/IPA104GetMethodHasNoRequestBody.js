import { collectExceptionAdoptionViolations } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-104-get-method-no-request-body';
const ERROR_MESSAGE = 'The Get method must not include a request body.';

export default (input, _, { path, documentInventory }) => {
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

  return collectExceptionAdoptionViolations(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(getOperationObject, path) {
  if (getOperationObject.requestBody) {
    return [{ path, message: ERROR_MESSAGE }];
  }
  return [];
}
