import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectException, collectAndReturnViolation } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';

const RULE_NAME = 'xgen-IPA-109-valid-operation-id';
const ERROR_MESSAGE = 'Invalid OperationID.';

export default (input, _, { path }) => {
  let resourcePath = path[1];
  const methodName = getCustomMethodName(resourcePath);

  if (!isCustomMethodIdentifier(resourcePath)) {
    return;
  }

  // TODO detect custom method extension - CLOUDP-306294

  let obj;
  if (input.post) {
    obj = input.post;
  } else if (input.get) {
    obj = input.get;
  }

  if (hasException(obj, RULE_NAME)) {
    collectException(obj, RULE_NAME, path);
    return;
  }

  const operationId = obj.operationId;
  const expectedOperationID = generateOperationID(methodName, stripCustomMethodName(resourcePath));
  if (expectedOperationID !== operationId) {
    const errors = [
      {
        path,
        message: `${ERROR_MESSAGE} Found ${operationId}, expected ${expectedOperationID}.`,
      },
    ];
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};
