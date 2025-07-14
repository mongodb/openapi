import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectException, collectAndReturnViolation } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';
import { hasCustomMethodOverride } from './utils/extensions.js';

const RULE_NAME = 'xgen-IPA-106-valid-operation-id';
const ERROR_MESSAGE = 'Invalid OperationID.';

export default (input, { methodName }, { path }) => {
  const resourcePath = path[1];

  if (hasCustomMethodOverride(input) || isCustomMethodIdentifier(resourcePath)) {
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
