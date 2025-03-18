import {
  hasGetMethod,
  isSingletonResource,
  getResourcePathItems,
  isResourceCollectionIdentifier,
} from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-105-resource-has-list';
const ERROR_MESSAGE = 'APIs must provide a List method for resources.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;

  if (!isResourceCollectionIdentifier(input) || isSingletonResource(getResourcePathItems(input, oas.paths))) {
    return;
  }

  if (hasException(oas.paths[input], RULE_NAME)) {
    collectException(oas.paths[input], RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(oas.paths[input], input, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(pathItem, input, path) {
  if (!hasGetMethod(pathItem)) {
    return [{ path, message: ERROR_MESSAGE }];
  }
  return [];
}
