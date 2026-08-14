import { allPropertiesAreReadOnly } from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isOperationsPath, isSingleOperationPath } from './utils/longRunningOperations.js';

const VALID_METHOD = 'get';
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const READ_ONLY_SCHEMA_ERROR_MESSAGE =
  'The Operation resource must be read-only. All properties of the GET response schema must be marked as readOnly: true.';

/**
 * Checks that an Operations endpoint defined by IPA-132 is a read-only resource: its path items
 * may only define the get method, and all properties of the Operation resource are readOnly.
 *
 * @param {string} input - The path key from the OpenAPI spec
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;

  if (!isOperationsPath(input)) {
    return;
  }

  const pathItem = oas.paths[input];
  const errors = checkViolationsAndReturnErrors(input, pathItem, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, pathItem, path);
};

function checkViolationsAndReturnErrors(input, pathItem, path, ruleName) {
  try {
    const errors = [];

    // Extract the keys which are equivalent of the http methods
    const httpMethods = Object.keys(pathItem).filter((key) => HTTP_METHODS.includes(key));
    for (const method of httpMethods) {
      if (method !== VALID_METHOD) {
        errors.push({
          path: [...path, method],
          message: `Operations endpoints are read-only and do not allow the ${method} method.`,
        });
      }
    }

    // The List method on the collection reuses the Operation resource schema, so the readOnly
    // condition is validated on the single Operation endpoint, where the Get method is defined
    if (isSingleOperationPath(input) && !hasReadOnlyGetResponseSchema(pathItem)) {
      errors.push({ path: [...path, 'get'], message: READ_ONLY_SCHEMA_ERROR_MESSAGE });
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}

function hasReadOnlyGetResponseSchema(pathItem) {
  const responses = pathItem.get?.responses ?? {};
  for (const [responseCode, response] of Object.entries(responses)) {
    if (!responseCode.startsWith('2')) {
      continue;
    }
    for (const mediaTypeObject of Object.values(response?.content ?? {})) {
      if (mediaTypeObject?.schema && !allPropertiesAreReadOnly(mediaTypeObject.schema)) {
        return false;
      }
    }
  }
  return true;
}
