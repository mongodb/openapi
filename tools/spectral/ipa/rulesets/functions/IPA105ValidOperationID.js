import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { generateOperationID } from './utils/operationIdGeneration.js';

const RULE_NAME = 'xgen-IPA-105-valid-operation-id';
const ERROR_MESSAGE =
  'Invalid OperationID. The Operation ID must start with the verb “list” and should be followed by a noun or compound noun. The noun(s) should be the collection identifiers from the resource identifier in singular form, where the last noun is in plural form.';

export default (input, { methodName }, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;

  if (
    isCustomMethodIdentifier(resourcePath) ||
    !isResourceCollectionIdentifier(resourcePath) ||
    isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
  ) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const expectedOperationId = generateOperationID(methodName, resourcePath);
  if (expectedOperationId !== input.operationId) {
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
