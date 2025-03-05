import { getResourcePaths, isChild, isCustomMethod, isSingletonResource } from './utils/resourceEvaluation.js';
import {
  generateOperationIdForCustomMethod,
  generateOperationIdForStandardMethod,
} from './utils/generateOperationId.js';

const BASE_PATH = '/api/atlas/v2';

export default (input, _, { path, documentInventory }) => {
  const operationId = input;
  const oas = documentInventory.resolved;
  const operationPath = path[1];
  const method = path[2];
  const resourcePaths = getResourcePaths(operationPath, Object.keys(oas.paths));

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

  if (isCustomMethod(operationPath)) {
    const expectedOperationId = generateOperationIdForCustomMethod(operationPath);
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
      if (isChild(operationPath) || isSingletonResource(resourcePaths)) {
        expectedOperationId = generateOperationIdForStandardMethod(operationPath, 'get');
      } else {
        expectedOperationId = generateOperationIdForStandardMethod(operationPath, 'list');
      }
      break;
    case 'post':
      expectedOperationId = generateOperationIdForStandardMethod(operationPath, 'create');
      break;
    case 'patch':
      expectedOperationId = generateOperationIdForStandardMethod(operationPath, 'update');
      break;
    case 'put':
      expectedOperationId = generateOperationIdForStandardMethod(operationPath, 'update');
      break;
    case 'delete':
      expectedOperationId = generateOperationIdForStandardMethod(operationPath, 'delete');
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
