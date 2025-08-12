import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { checkResponseCodeAndReturnErrors } from './utils/validations/checkResponseCodeAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-104-get-method-response-code-is-200';
const ERROR_MESSAGE =
  'The Get method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code.';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    !isSingleResourceIdentifier(resourcePath) &&
    !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths))
  ) {
    return;
  }

  const errors = checkResponseCodeAndReturnErrors(input, '200', path, RULE_NAME, ERROR_MESSAGE);

  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};
