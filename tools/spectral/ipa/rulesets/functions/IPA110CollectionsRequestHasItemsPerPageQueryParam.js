import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { checkPaginationQueryParameterAndReturnErrors } from './utils/validations/checkPaginationQueryParameterAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-110-collections-request-has-itemsPerPage-query-param';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];

  if (
    !isResourceCollectionIdentifier(resourcePath) ||
    isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
  ) {
    return;
  }

  const errors = checkPaginationQueryParameterAndReturnErrors(input, path, 'itemsPerPage', 100, RULE_NAME);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};
