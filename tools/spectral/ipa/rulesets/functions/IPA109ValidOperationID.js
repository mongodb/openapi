import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectException, collectAndReturnViolation } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';
import { hasMethodWithVerbOverride, hasCustomMethodOverride, VERB_OVERRIDE_EXTENSION } from './utils/extensions.js';

const RULE_NAME = 'xgen-IPA-109-valid-operation-id';
const ERROR_MESSAGE = 'Invalid OperationID.';

export default (input, _, { path }) => {
  let resourcePath = path[1];

  if (!isCustomMethodIdentifier(resourcePath) && !hasMethodWithVerbOverride(input)) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  if (isCustomMethodIdentifier(resourcePath)) {
    let obj;
    if (input.post) {
      obj = input.post;
    } else if (input.get) {
      obj = input.get;
    } else {
      return;
    }

    const operationId = obj.operationId;
    const expectedOperationID = generateOperationID(
      getCustomMethodName(resourcePath),
      stripCustomMethodName(resourcePath)
    );
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
    const methods = Object.values(input);
    let errors = [];
    methods.forEach((method) => {
      if (hasCustomMethodOverride(method)) {
        const operationId = method.operationId;
        const expectedOperationID = generateOperationID(method[VERB_OVERRIDE_EXTENSION].verb, resourcePath);
        if (operationId !== expectedOperationID) {
          errors.push({
            path,
            message: `${ERROR_MESSAGE} Found ${operationId}, expected ${expectedOperationID}.`,
          });
        }
      }
    });

    if (errors.length !== 0) {
      return collectAndReturnViolation(path, RULE_NAME, errors);
    }
  } else {
    return;
  }

  collectAdoption(path, RULE_NAME);
};
