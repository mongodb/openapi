import {
  hasGetMethod,
  isChild,
  isCustomMethod,
  isStandardResource,
  isSingletonResource,
  getResourcePaths,
} from './utils/resourceEvaluation.js';
import { collectException, hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-104-resource-has-GET';
const ERROR_MESSAGE = 'APIs must provide a get method for resources.';

export default (input, _, { path, documentInventory }) => {
  if (isChild(input) || isCustomMethod(input)) {
    return;
  }

  const oas = documentInventory.resolved;

  if (hasException(oas.paths[input], RULE_NAME)) {
    collectException(oas.paths[input], RULE_NAME, path);
    return;
  }

  const resourcePaths = getResourcePaths(input, Object.keys(oas.paths));

  if (isSingletonResource(resourcePaths)) {
    if (!hasGetMethod(oas.paths[resourcePaths[0]])) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  } else if (isStandardResource(resourcePaths)) {
    if (!hasGetMethod(oas.paths[resourcePaths[1]])) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  }

  collectAdoption(path, RULE_NAME);
};
