import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectException, collectAndReturnViolation } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';
import { hasVerbOverride } from './utils/extensions.js';

const RULE_NAME = 'xgen-IPA-109-valid-operation-id';
const ERROR_MESSAGE = 'Invalid OperationID.';

export default (input, _, { path }) => {
  let resourcePath = path[1];

  if (!isCustomMethodIdentifier(resourcePath) && !hasMethodWithVerbOverride(input)) {
    return;
  }

  let expectedOperationID = '';
  if (isCustomMethodIdentifier(resourcePath)) {
    expectedOperationID = generateOperationID(getCustomMethodName(resourcePath), stripCustomMethodName(resourcePath));
  } else if (hasVerbOverride(input)) {


    //const ext = input['x-xgen-method-verb-override'];
    //expectedOperationID = generateOperationID(ext.verb, resourcePath);
  }

  let obj;
  if (input.post) {
    obj = input.post;
  } else if (input.get) {
    obj = input.get;
  } else if (input.delete) {
    obj = input.delete;
    console.log("yes");
  } else {
    console.log('AHHHHH', input);
    return;
  }

  if (hasException(obj, RULE_NAME)) {
    collectException(obj, RULE_NAME, path);
    return;
  }

  const operationId = obj.operationId;
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
