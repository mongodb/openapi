import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectException, collectAndReturnViolation } from './utils/collectionUtils.js';
import {
  isSingleResourceIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
  getResourcePathItems,
  isCustomMethodIdentifier,
} from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';

const RULE_NAME = 'xgen-IPA-107-valid-operation-id';
const ERROR_MESSAGE = 'Invalid OperationID.';

export default (input, { methodName }, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    isCustomMethodIdentifier(resourcePath) ||
    (!isSingleResourceIdentifier(resourcePath) &&
      !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths)))
  ) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const expectedOperationID = generateOperationID(methodName, resourcePath);
  if (expectedOperationID !== input.operationId) {
    const errors = [
      {
        path,
        message: `${ERROR_MESSAGE} Found ${input.operationId}, expected ${expectedOperationID}.`,
      },
    ];
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};
