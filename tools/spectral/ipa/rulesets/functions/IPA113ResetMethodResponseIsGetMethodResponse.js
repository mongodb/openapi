import { getResourcePathItems, isResetMethod, stripCustomMethodName } from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getGETMethodResponseSchemaFromPathItem, getSchemaRef } from './utils/methodUtils.js';

const ERROR_MESSAGE =
  'The schema in the :reset method response must be the same schema as the response of the Get method.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const mediaType = input;

  if (!mediaType.endsWith('json') || !isResetMethod(resourcePath)) {
    return;
  }

  // Ignore if the Reset method does not have a response schema
  const resetMethodResponse = resolveObject(oas, path);

  if (!resetMethodResponse || !resetMethodResponse.schema) {
    return;
  }

  // Get the base resource path (without :reset)
  const baseResourcePath = stripCustomMethodName(resourcePath);
  const resourcePathItems = getResourcePathItems(baseResourcePath, oas.paths);

  // Ignore if there is no matching Get method on the base resource
  const basePathItem = resourcePathItems[baseResourcePath];
  if (!basePathItem) {
    return;
  }

  const getMethodResponseContentPerMediaType = getGETMethodResponseSchemaFromPathItem(basePathItem, mediaType);
  if (!getMethodResponseContentPerMediaType) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(
    path,
    resetMethodResponse,
    getMethodResponseContentPerMediaType,
    ruleName
  );
  return evaluateAndCollectAdoptionStatus(errors, ruleName, resetMethodResponse, path);
};

function checkViolationsAndReturnErrors(path, resetMethodResponseContent, getMethodResponseContent, ruleName) {
  try {
    // Error if the Get method does not have a schema
    if (!getMethodResponseContent.schema) {
      return [
        {
          path,
          message: `Could not validate that the :reset method returns the same resource object as the Get method. The Get method does not have a schema.`,
        },
      ];
    }

    const resetMethodSchemaRef = getSchemaRef(resetMethodResponseContent.schema);
    const getMethodSchemaRef = getSchemaRef(getMethodResponseContent.schema);

    // Error if the Get method does not have a schema ref
    if (!getMethodSchemaRef) {
      return [
        {
          path,
          message: `Could not validate that the :reset method returns the same resource object as the Get method. The Get method does not have a schema reference.`,
        },
      ];
    }

    // Error if the get method resource is not the same as the reset method resource
    if (getMethodSchemaRef !== resetMethodSchemaRef) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
