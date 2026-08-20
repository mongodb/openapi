import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const ERROR_MESSAGE =
  'The Get method must not be a long-running operation. A Get returns the current state of a resource that already exists on the server.';

/**
 * Checks that a Get method is not modeled as a long-running operation defined by IPA-132, i.e. it
 * does not declare a 202 response.
 *
 * @param {object} input - The GET operation object
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    !isSingleResourceIdentifier(resourcePath) &&
    !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths))
  ) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(operation, path, ruleName) {
  try {
    const responses = operation.responses;
    if (responses && Object.keys(responses).includes('202')) {
      return [{ path: [...path, 'responses', '202'], message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
