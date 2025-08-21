import {
  getResourcePathItems,
  hasGetMethod,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';

const ERROR_MESSAGE = 'APIs must provide a List method for resources.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  if (!isResourceCollectionIdentifier(input) || isSingletonResource(getResourcePathItems(input, oas.paths))) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(oas.paths[input], input, path);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, oas.paths[input], path);
};

function checkViolationsAndReturnErrors(pathItem, input, path) {
  if (!hasGetMethod(pathItem)) {
    return [{ path, message: ERROR_MESSAGE }];
  }
  return [];
}
