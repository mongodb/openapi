import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { checkPaginationQueryParameterAndReturnErrors } from './utils/validations/checkPaginationQueryParameterAndReturnErrors.js';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const resourcePath = path[1];

  if (
    !isResourceCollectionIdentifier(resourcePath) ||
    isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
  ) {
    return;
  }

  const errors = checkPaginationQueryParameterAndReturnErrors(input, path, 'itemsPerPage', 100, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};
