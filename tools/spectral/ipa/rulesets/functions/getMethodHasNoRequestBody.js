import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-104-get-method-no-request-body';
const ERROR_MESSAGE = 'The Get method must not include a request body.';

export default (input, _, { path, documentInventory }) => {
  if (!input) {
    return;
  }

  const resourcePath = path[1];
  const oas = documentInventory.resolved;

  if (
    isSingleResourceIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    if (hasException(input, RULE_NAME)) {
      collectException(input, RULE_NAME, path);
      return;
    }

    if (input.requestBody) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
    collectAdoption(path, RULE_NAME);
  }
};
