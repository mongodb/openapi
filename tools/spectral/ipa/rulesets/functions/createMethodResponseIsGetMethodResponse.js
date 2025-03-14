import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { getSchemaRef, getResponseOfGetMethodByMediaType } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-response-is-get-method-response';
const ERROR_MESSAGE =
  'The schema in the Create method response must be the same schema as the response of the Get method.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const mediaType = input;

  if (
    !mediaType.endsWith('json') ||
    !isResourceCollectionIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    return;
  }

  // Ignore if the List method does not have a response schema
  const createMethodResponse = resolveObject(oas, path);

  if (!createMethodResponse || !createMethodResponse.schema) {
    return;
  }

  if (hasException(createMethodResponse, RULE_NAME)) {
    collectException(createMethodResponse, RULE_NAME, path);
    return;
  }

  // Ignore if there is no matching Get method
  const getMethodResponseContentPerMediaType = getResponseOfGetMethodByMediaType(mediaType, resourcePath, oas);
  if (!getMethodResponseContentPerMediaType) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(path, createMethodResponse, getMethodResponseContentPerMediaType);

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(path, createMethodResponseContent, getMethodResponseContent) {
  try {
    // Error if the Get method does not have a schema
    if (!getMethodResponseContent.schema) {
      return [
        {
          path,
          message: `Could not validate that the Create method returns the same resource object as the Get method. The Get method does not have a schema.`,
        },
      ];
    }

    console.log(getMethodResponseContent);
    const createMethodSchemaRef = getSchemaRef(createMethodResponseContent.schema);
    const getMethodSchemaRef = getSchemaRef(getMethodResponseContent.schema);

    // Error if the Get method does not have a schema ref
    if (!getMethodSchemaRef) {
      return [
        {
          path,
          message: `Could not validate that the Create method returns the same resource object as the Get method. The Get method does not have a schema reference.`,
        },
      ];
    }

    // Error if the get method resource is not the same as the create method resource
    if (getMethodSchemaRef !== createMethodSchemaRef) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
