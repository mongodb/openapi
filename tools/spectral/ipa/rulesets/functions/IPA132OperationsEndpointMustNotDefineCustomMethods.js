import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { isOperationsPath } from './utils/longRunningOperations.js';

const ERROR_MESSAGE =
  'Operations endpoints must not define custom methods. Control actions require mutating methods, which the read-only Operations resource does not allow.';

/**
 * Checks that Operations endpoints defined by IPA-132 do not define custom methods, i.e. no
 * custom method path is attached to the Operations collection or to a single Operation.
 *
 * @param {string} input - The path key from the OpenAPI spec
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  if (!isCustomMethodIdentifier(input)) {
    return;
  }

  const resourceIdentifier = stripCustomMethodName(input);
  if (!isOperationsPath(resourceIdentifier)) {
    return;
  }

  return evaluateAndCollectAdoptionStatus([{ path, message: ERROR_MESSAGE }], ruleName, oas.paths[input], path);
};
