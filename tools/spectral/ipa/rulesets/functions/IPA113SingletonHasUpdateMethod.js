import {
  getResourcePathItems,
  hasPatchMethod,
  hasPutMethod,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import {
  evaluateAndCollectAdoptionStatus,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-113-singleton-should-have-update-method';
const ERROR_MESSAGE =
  'Singleton resources should define the Update method. If this is not a singleton resource, please implement all CRUDL methods.';

export default (input, opts, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (!(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePathItems))) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(input, path) {
  try {
    if (!(hasPutMethod(input) || hasPatchMethod(input))) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
