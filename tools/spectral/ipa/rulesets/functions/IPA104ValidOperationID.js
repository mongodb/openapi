import { generateOperationID } from './utils/operationIdGeneration.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-104-valid-operation-id';
const ERROR_MESSAGE =
  '';

export default (input, _, { path, documentInventory }) => {
  //const resourcePath = path[1];
  //const oas = documentInventory.resolved;

  console.log(input.operationId, path[1]);

  const expectedOperationId = generateOperationID("get", path[1]);
  if (expectedOperationId === input.operationId) {
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

function checkViolationsAndReturnErrors(getOperationObject, path) {
  if (getOperationObject.operationId) {
    return [{ path, message: ERROR_MESSAGE }];
  }
  return [];
}
