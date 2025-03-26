import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { checkPaginationQueryParameterAndReturnErrors } from './utils/validations.js';

const RULE_NAME = 'xgen-IPA-110-collections-request-has-itemsPerPage-query-param';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];

  if (
    !isResourceCollectionIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    return;
  }

  // Check for exception
  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const errors = checkPaginationQueryParameterAndReturnErrors(input, path, 'itemsPerPage', 100, RULE_NAME);

  if (errors.length > 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};
