import {
  getResourcePathItems,
  isSingleResourceIdentifier,
  isCustomMethodIdentifier,
  isSingletonResource,
  isResourceCollectionIdentifier,
} from './utils/resourceEvaluation.js';
import {
  generateOperationIdForCustomMethod_inflector,
  generateOperationIdForStandardMethod_inflector,
} from './utils/generateOperationId.js';

const BASE_PATH = '/api/atlas/v2';

export default (input, _, { path, documentInventory }) => {
  const operationId = input;
  const oas = documentInventory.resolved;
  const operationPath = path[1];
  const method = path[2];
  const resourcePathItems = getResourcePathItems(operationPath, oas.paths);

  if (operationPath === BASE_PATH) {
    const expectedOperationId = 'getSystemStatus';
    if (operationId !== expectedOperationId) {
      return [
        {
          message: `Invalid operation ID ${operationId}, please change to ${expectedOperationId}`,
        },
      ];
    }
    return;
  }

  if (isCustomMethodIdentifier(operationPath)) {
    const expectedOperationId = generateOperationIdForCustomMethod_inflector(operationPath);
    if (operationId !== expectedOperationId) {
      return [
        {
          message: `Invalid operation ID ${operationId}, please change to ${expectedOperationId}`,
        },
      ];
    }
    return;
  }

  let expectedOperationId = '';
  switch (method) {
    case 'get':
      if (isResourceCollectionIdentifier(operationPath)) {
        if (isSingletonResource(resourcePathItems)) {
          expectedOperationId = generateOperationIdForStandardMethod_inflector(operationPath, 'get', false);
        } else {
          expectedOperationId = generateOperationIdForStandardMethod_inflector(operationPath, 'list', false);
        }
      } else {
        expectedOperationId = generateOperationIdForStandardMethod_inflector(
          operationPath,
          'get',
          isSingleResourceIdentifier(operationPath)
        );
      }
      break;
    case 'post':
      expectedOperationId = generateOperationIdForStandardMethod_inflector(operationPath, 'create', true);
      break;
    case 'patch':
      expectedOperationId = generateOperationIdForStandardMethod_inflector(
        operationPath,
        'update',
        !isSingletonResource(resourcePathItems)
      );
      break;
    case 'put':
      expectedOperationId = generateOperationIdForStandardMethod_inflector(operationPath, 'update', true);
      break;
    case 'delete':
      expectedOperationId = generateOperationIdForStandardMethod_inflector(operationPath, 'delete', true);
      break;
  }
  if (!expectedOperationId) {
    console.error('Unsupported http method');
    return;
  }

  if (operationId !== expectedOperationId) {
    return [
      {
        message: `Invalid operation ID ${operationId}, please change to ${expectedOperationId}`,
      },
    ];
  }
};
