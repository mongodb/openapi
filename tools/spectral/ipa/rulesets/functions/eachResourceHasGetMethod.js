import {
  hasGetMethod,
  isSingletonResource,
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
} from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-104-resource-has-GET';
const ERROR_MESSAGE = 'APIs must provide a get method for resources.';

export default (input, _, { path, documentInventory }) => {
  if (!isResourceCollectionIdentifier(input)) {
    return;
  }

  const oas = documentInventory.resolved;

  if (hasException(oas.paths[input], RULE_NAME)) {
    collectException(oas.paths[input], RULE_NAME, path);
    return;
  }

  const resourcePathItems = getResourcePathItems(input, oas.paths);
  const resourcePaths = Object.keys(resourcePathItems);

  if (isSingletonResource(resourcePathItems)) {
    if (!hasGetMethod(resourcePathItems[resourcePaths[0]])) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  } else {
    if (resourcePaths.length === 1) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
    const singleResourcePath = resourcePaths.find((p) => isSingleResourceIdentifier(p));
    if (!singleResourcePath || !hasGetMethod(resourcePathItems[singleResourcePath])) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  }

  collectAdoption(path, RULE_NAME);
};
