import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectException, collectAndReturnViolation } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';
import { hasMethodWithVerbOverride, hasCustomMethodOverride } from './utils/extensions.js';

const RULE_NAME = 'xgen-IPA-109-valid-operation-id';
const ERROR_MESSAGE = 'Invalid OperationID.';

export default (input, _, { path }) => {
  let resourcePath = path[1];

  if (!isCustomMethodIdentifier(resourcePath) && !hasMethodWithVerbOverride(input)) {
    return;
  }

  let errors = [];
  let expectedOperationID = '';
  if (isCustomMethodIdentifier(resourcePath)) {
    expectedOperationID = generateOperationID(getCustomMethodName(resourcePath), stripCustomMethodName(resourcePath));

    let obj;
    if (input.post) {
      obj = input.post;
    } else if (input.get) {
      obj = input.get;
    } else {
      return;
    }

    if (hasException(obj, RULE_NAME)) {
      collectException(obj, RULE_NAME, path);
      return;
    }

    const operationId = obj.operationId;
    if (operationId !== expectedOperationID) {
      const errors = [
        {
          path,
          message: `${ERROR_MESSAGE} Found ${operationId}, expected ${expectedOperationID}.`,
        },
      ];
      return collectAndReturnViolation(path, RULE_NAME, errors);
    }
  } else if (hasMethodWithVerbOverride(input)) {
    const methods = Object.keys(input);
    for (let i = 0; i < methods.length; i++) {
      let obj = input[methods[i]];
      const operationId = obj.operationId;
      if (hasCustomMethodOverride(obj)) {
        expectedOperationID = generateOperationID(obj['x-xgen-method-verb-override'].verb, resourcePath);
        if (operationId !== expectedOperationID) {
          errors.push({
            path,
            message: `${ERROR_MESSAGE} Found ${operationId}, expected ${expectedOperationID}.`,
          });
        }
      }
    }
  } else {
    return;
  }

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};
