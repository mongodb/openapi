import {
  hasGetMethod,
  isChild,
  isCustomMethod,
  isStandardResource,
  isSingletonResource,
  getResourcePaths,
} from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import collector, { EntryType } from '../../metrics/Collector.js';

const RULE_NAME = 'xgen-IPA-104-resource-has-GET';
const ERROR_MESSAGE = 'APIs must provide a get method for resources.';

export default (input, _, { path, documentInventory }) => {
  if (isChild(input) || isCustomMethod(input)) {
    return;
  }

  const oas = documentInventory.resolved;

  if (hasException(oas.paths[input], RULE_NAME, path)) {
    return;
  }

  const resourcePaths = getResourcePaths(input, Object.keys(oas.paths));

  if (isSingletonResource(resourcePaths)) {
    if (!hasGetMethod(oas.paths[resourcePaths[0]])) {
      collector.add(path, RULE_NAME, EntryType.VIOLATION);
      return [
        {
          message: ERROR_MESSAGE,
        },
      ];
    }
  } else if (isStandardResource(resourcePaths)) {
    if (!hasGetMethod(oas.paths[resourcePaths[1]])) {
      collector.add(path, RULE_NAME, EntryType.VIOLATION);
      return [
        {
          message: ERROR_MESSAGE,
        },
      ];
    }
  }

  collector.add(path, RULE_NAME, EntryType.ADOPTION);
};
