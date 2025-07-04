import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';

const RULE_NAME = 'xgen-IPA-107-valid-operation-id';
const ERROR_MESSAGE = 'Invalid OperationID';

export default (input, _, { path, documentInventory }) => {
  let resourcePath = path[1];
  const oas = documentInventory.resolved;
  let methodName = 'update';

  // TODO detect exceptions

  if (isCustomMethodIdentifier(resourcePath)) {
    methodName = getCustomMethodName(resourcePath);
    resourcePath = stripCustomMethodName(resourcePath);
  }

  let errors = [];
  const expectedOperationID = generateOperationID(methodName, resourcePath);
  if (expectedOperationID != input.operationId) {
    errors.push({
      path: path,
      message: `${ERROR_MESSAGE} Found ${input.operationId} expected ${expectedOperationID}.`,
    });
  }

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};
