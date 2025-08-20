import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getGETMethodResponseSchemaFromPathItem, getSchemaRef } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-107-update-method-response-is-get-method-response';
const ERROR_MESSAGE =
  'The schema in the Update method response must be the same schema as the response of the Get method.';

/**
 * Update method (PUT, PATCH) responses should reference the same schema as the Get method.
 *
 * @param {string} input - An update operation 200 response content version
 * @param {object} _ - Unused
 * @param {{ path: string[], documentInventory: object}} context - The context object containing the path and document
 */
export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const mediaType = input;
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (
    !mediaType.endsWith('json') ||
    (!isSingleResourceIdentifier(resourcePath) &&
      !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePathItems)))
  ) {
    return;
  }

  // Ignore if the Update method does not have a response schema
  const updateMethodResponse = resolveObject(oas, path);

  if (!updateMethodResponse || !updateMethodResponse.schema) {
    return;
  }

  // Ignore if there is no matching Get method
  const getMethodResponseContentPerMediaType = getGETMethodResponseSchemaFromPathItem(
    oas.paths[resourcePath],
    mediaType
  );
  if (!getMethodResponseContentPerMediaType) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(path, updateMethodResponse, getMethodResponseContentPerMediaType);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, updateMethodResponse, path);
};

function checkViolationsAndReturnErrors(path, updateMethodResponseContent, getMethodResponseContent) {
  try {
    // Error if the Get method does not have a schema
    if (!getMethodResponseContent.schema) {
      return [
        {
          path,
          message: `Could not validate that the Update method returns the same resource object as the Get method. The Get method does not have a schema.`,
        },
      ];
    }

    const updateMethodSchemaRef = getSchemaRef(updateMethodResponseContent.schema);
    const getMethodSchemaRef = getSchemaRef(getMethodResponseContent.schema);

    // Error if the Get method does not have a schema ref
    if (!getMethodSchemaRef) {
      return [
        {
          path,
          message: `Could not validate that the Update method returns the same resource object as the Get method. The Get method does not have a schema reference.`,
        },
      ];
    }

    // Error if the get method resource is not the same as the update method resource
    if (getMethodSchemaRef !== updateMethodSchemaRef) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
