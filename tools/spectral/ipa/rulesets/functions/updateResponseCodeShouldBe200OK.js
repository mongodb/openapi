import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { checkResponseCodeAndReturnErrors } from './utils/validations.js';

const ERROR_MESSAGE =
  'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.';

export default (input, _, { path, documentInventory, rule }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);
  const ruleName = rule.name;

  if (
    !isSingleResourceIdentifier(resourcePath) &&
    !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths))
  ) {
    return;
  }

  if (hasException(input, ruleName)) {
    collectException(input, ruleName, path);
    return;
  }

  const errors = checkResponseCodeAndReturnErrors(input, '200', path, ruleName, ERROR_MESSAGE);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, ruleName, errors);
  }
  collectAdoption(path, ruleName);
};
