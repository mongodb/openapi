import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { checkResponseCodeAndReturnErrors } from './utils/validations/checkResponseCodeAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-106-create-method-response-code-is-201';
const ERROR_MESSAGE =
  'The Create method must return a 201 Created response. This method either lacks a 201 Created response or defines a different 2xx status code.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);
  if (isCustomMethodIdentifier(resourcePath) || !isResourceCollection) {
    return;
  }

  const errors = checkResponseCodeAndReturnErrors(input, '201', path, RULE_NAME, ERROR_MESSAGE);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};
