import {
  hasGetMethod,
  isChild,
  isCustomMethod,
  isStandardResource,
  isSingletonResource,
  getResourcePaths,
} from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'APIs must provide a get method for resources.';

export default (input, _, { documentInventory }) => {
  if (isChild(input) || isCustomMethod(input)) {
    return;
  }

  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePaths(input, Object.keys(oas.paths));

  if (isSingletonResource(resourcePaths)) {
    if (!hasGetMethod(oas.paths[resourcePaths[0]])) {
      return [
        {
          message: ERROR_MESSAGE,
        },
      ];
    }
  } else if (isStandardResource(resourcePaths)) {
    if (!hasGetMethod(oas.paths[resourcePaths[1]])) {
      return [
        {
          message: ERROR_MESSAGE,
        },
      ];
    }
  }
};
