import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { checkResponseCodeAndReturnErrors } from './utils/validations/checkResponseCodeAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-105-list-method-response-code-is-200';
const ERROR_MESSAGE =
  'The List method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code.';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;

  if (
    !isResourceCollectionIdentifier(resourcePath) ||
    isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
  ) {
    return;
  }

  const errors = checkResponseCodeAndReturnErrors(input, '200', path, RULE_NAME, ERROR_MESSAGE);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};
