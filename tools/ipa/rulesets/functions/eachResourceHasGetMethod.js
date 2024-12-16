import { hasException } from './utils/exemptions.js';
import {
  hasGetMethod,
  isChild,
  isCustomMethod,
  isStandardResource,
  isSingletonResource,
  getResourcePaths,
} from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-104-resource-has-GET';
const ERROR_MESSAGE = 'APIs must provide a get method for resources.';

export default (input, _, context) => {
  if (isChild(input) || isCustomMethod(input)) {
    return;
  }

  const oas = context.documentInventory.resolved;
  const resourceObject = oas.paths[input];

  if (hasException(RULE_NAME, resourceObject, context)) {
    return;
  }

  const resourcePaths = getResourcePaths(input, Object.keys(oas.paths));

  if (isSingletonResource(resourcePaths)) {
    // Singleton resource, may have custom methods
    if (!hasGetMethod(oas.paths[resourcePaths[0]])) {
      return [
        {
          message: ERROR_MESSAGE,
        },
      ];
    }
  } else if (isStandardResource(resourcePaths)) {
    // Normal resource, may have custom methods
    if (!hasGetMethod(oas.paths[resourcePaths[1]])) {
      return [
        {
          message: ERROR_MESSAGE,
        },
      ];
    }
  }
};
