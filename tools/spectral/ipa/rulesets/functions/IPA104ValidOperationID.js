import { generateOperationID } from './utils/operationIdGeneration.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';
import {
  isSingleResourceIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
  getResourcePathItems,
  isCustomMethodIdentifier,
} from './utils/resourceEvaluation.js';
import { hasVerbOverride, isGetOverride, isLegacyCustomMethod, isListOverride } from './utils/extensions.js';
import { invalidGetMethod } from './utils/methodLogic.js';

const RULE_NAME = 'xgen-IPA-104-valid-operation-id';
const ERROR_MESSAGE = 'Invalid OperationID.';

export default (input, { methodName }, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    isLegacyCustomMethod(input) ||
    isCustomMethodIdentifier(resourcePath) ||
    isListOverride(input) ||
    (invalidGetMethod(resourcePath, resourcePaths) && !isGetOverride(input))
  ) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const expectedOperationId = generateOperationID(methodName, resourcePath);
  if (expectedOperationId !== input.operationId) {
    if (isGetOverride(input)) {
      console.log( `${input.operationId}, ${expectedOperationId}, ${resourcePath}, ${input.deprecated ? 'TRUE' : 'FALSE'}, ${resourcePath, input['x-xgen-owner-team']}`);
    }
    const errors = [
      {
        path,
        message: `${ERROR_MESSAGE} Found ${input.operationId}, expected ${expectedOperationId}.`,
      },
    ];
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  return collectAdoption(path, RULE_NAME);
};
