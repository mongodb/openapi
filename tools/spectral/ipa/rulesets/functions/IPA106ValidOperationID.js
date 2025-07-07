import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectException, collectAndReturnViolation } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, getCustomMethodName, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';

const RULE_NAME = 'xgen-IPA-106-valid-operation-id';
const ERROR_MESSAGE =
  'Invalid OperationID. The Operation ID must start with the verb “create” and should be followed by a noun or compound noun. The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form.';

export default (input, _, { path }) => {
  let resourcePath = path[1];
  let methodName = 'create';

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  // TODO detect custom method extension - CLOUDP-306294

  if (isCustomMethodIdentifier(resourcePath)) {
    methodName = getCustomMethodName(resourcePath);
    resourcePath = stripCustomMethodName(resourcePath);
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
