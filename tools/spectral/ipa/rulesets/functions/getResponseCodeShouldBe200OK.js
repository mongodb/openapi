import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-104-get-method-response-code-is-200';
const ERROR_MESSAGE =
  'The Get method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code.';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    !isSingleResourceIdentifier(resourcePath) &&
    !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths))
  ) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(input, path) {
  try {
    const responses = input.responses;
    // If there is no 200 response, return a violation
    if (!responses || !responses['200']) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    // If there are other 2xx responses that are not 200, return a violation
    if (Object.keys(responses).some((key) => key.startsWith('2') && key !== '200')) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
