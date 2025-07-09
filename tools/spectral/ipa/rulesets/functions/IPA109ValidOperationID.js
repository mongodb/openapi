import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectException, collectAndReturnViolation } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';

const RULE_NAME = 'xgen-IPA-109-valid-operation-id';
const ERROR_MESSAGE = 'Invalid Operation ID';

export default (input, _, { path }) => {
  let resourcePath = path[1];

  if (!isCustomMethodIdentifier(resourcePath)) {
    return;
  }
  //console.log(resourcePath);

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  //console.log(input['post'].operationId)
  // TODO detect custom method extension - CLOUDP-306294
  let methodName = getCustomMethodName(resourcePath);
  resourcePath = stripCustomMethodName(resourcePath);
  const operationId = input.post.operationId;

  const expectedOperationID = generateOperationID(methodName, resourcePath);
  if (expectedOperationID !== operationId) {
    console.log(operationId, expectedOperationID)
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
