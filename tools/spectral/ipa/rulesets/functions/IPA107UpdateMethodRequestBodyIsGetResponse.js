import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { getGETMethodResponseSchemaFromPathItem } from './utils/methodUtils.js';
import { checkRequestResponseResourceEqualityAndReturnErrors } from './utils/validations/checkRequestResponseResourceEqualityAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-107-update-method-request-body-is-get-method-response';
const ERROR_MESSAGE =
  'The request body schema properties of the Update method must match the response body schema properties of the Get method.';

/**
 * Update method (PUT, PATCH) request body schema properties must match the response body schema properties of the Get method.
 *
 * @param {string} input - An update operation request content version
 * @param {object} _ - Unused
 * @param {{ path: string[], documentInventory: object}} context - The context object containing the path and document
 */
export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const unresolvedOas = documentInventory.unresolved;
  const resourcePath = path[1];
  const mediaType = input;
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (
    !input.endsWith('json') ||
    (!isSingleResourceIdentifier(resourcePath) &&
      !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePathItems)))
  ) {
    return;
  }

  // Ignore if the Update method does not have a request body schema
  const updateMethodRequest = resolveObject(oas, path);

  if (!updateMethodRequest || !updateMethodRequest.schema) {
    return;
  }

  // Ignore if there is no matching Get method
  const getMethodResponse = getGETMethodResponseSchemaFromPathItem(oas.paths[resourcePath], mediaType);
  if (!getMethodResponse) {
    return;
  }

  const updateMethodRequestUnresolved = resolveObject(unresolvedOas, path);
  const getMethodResponseUnresolved = getGETMethodResponseSchemaFromPathItem(
    unresolvedOas.paths[resourcePath],
    mediaType
  );

  const errors = checkRequestResponseResourceEqualityAndReturnErrors(
    path,
    updateMethodRequest,
    getMethodResponse,
    updateMethodRequestUnresolved,
    getMethodResponseUnresolved,
    'Update',
    'Get',
    ERROR_MESSAGE
  );
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, updateMethodRequest, path);
};
