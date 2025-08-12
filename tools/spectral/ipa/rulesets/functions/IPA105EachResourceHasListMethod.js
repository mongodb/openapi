import {
  hasGetMethod,
  isSingletonResource,
  getResourcePathItems,
  isResourceCollectionIdentifier,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-105-resource-has-list';
const ERROR_MESSAGE = 'APIs must provide a List method for resources.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;

  if (!isResourceCollectionIdentifier(input) || isSingletonResource(getResourcePathItems(input, oas.paths))) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(oas.paths[input], input, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, oas.paths[input], path);
};

function checkViolationsAndReturnErrors(pathItem, input, path) {
  if (!hasGetMethod(pathItem)) {
    return [{ path, message: ERROR_MESSAGE }];
  }
  return [];
}
