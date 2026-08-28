import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { isNonLegacyLongRunningOperation, isSingleOperationPath } from './utils/longRunningOperations.js';

/**
 * Checks that a long-running operation defined by IPA-132 exposes an Operations endpoint: both the
 * Operations collection and the single Operation endpoint must be defined, each with the get method
 * clients poll for status, and nested under the resource that spawns the operations. A mutation of a
 * collection must expose them under the collection path, a mutation of a single resource under the
 * resource instance path.
 *
 * @param {object} input - The operation object of a mutating method
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  if (!isNonLegacyLongRunningOperation(input)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(path[1], oas, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(resourcePath, oas, path, ruleName) {
  try {
    const basePath = isCustomMethodIdentifier(resourcePath) ? stripCustomMethodName(resourcePath) : resourcePath;

    const operationsCollectionPath = `${basePath}/operations`;
    if (definesGet(oas, operationsCollectionPath) && hasReadableSingleOperationChild(oas, operationsCollectionPath)) {
      return [];
    }

    return [
      {
        path,
        message: `The long-running operation must expose an Operations endpoint: define ${basePath}/operations and ${basePath}/operations/{operationId}, each with a get method.`,
      },
    ];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}

function hasReadableSingleOperationChild(oas, operationsCollectionPath) {
  return Object.keys(oas.paths).some(
    (pathKey) =>
      pathKey.startsWith(`${operationsCollectionPath}/{`) && isSingleOperationPath(pathKey) && definesGet(oas, pathKey)
  );
}

function definesGet(oas, pathKey) {
  return Boolean(oas.paths[pathKey]?.get);
}
