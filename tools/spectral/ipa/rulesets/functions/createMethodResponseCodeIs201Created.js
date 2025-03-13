import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-response-code-is-201';
const ERROR_MESSAGE =
  'The Create method must return a 201 Created response. This method either lacks a 201 Created response or defines a different 2xx status code.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);
  if (isCustomMethodIdentifier(resourcePath) || !isResourceCollection) {
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

    // If there is no 201 response, return a violation
    if (!responses || !responses['201']) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    // If there are other 2xx responses that are not 201, return a violation
    if (Object.keys(responses).some((key) => key.startsWith('2') && key !== '201')) {
      return [{ path, message: ERROR_MESSAGE }];
    }

    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
