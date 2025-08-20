import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import {
  evaluateAndCollectAdoptionStatus,
  handleInternalError,
} from './utils/collectionUtils.js';
import {
  getResponseOfGetMethodByMediaType,
  getSchemaNameFromRef,
  getSchemaRef,
} from './utils/methodUtils.js';
import { schemaIsPaginated } from './utils/schemaUtils.js';

const RULE_NAME = 'xgen-IPA-105-list-method-response-is-get-method-response';
const ERROR_MESSAGE =
  'The schema of each result in the List method response must be the same schema as the response of the Get method.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const mediaType = input;

  if (
    !mediaType.endsWith('json') ||
    !isResourceCollectionIdentifier(resourcePath) ||
    isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
  ) {
    return;
  }

  // Ignore if the List method does not have a response schema
  const listMethodResponse = resolveObject(oas, path);

  if (!listMethodResponse || !listMethodResponse.schema) {
    return;
  }

  // Get list response schema from ref or inline schema
  let resolvedListSchema;
  const listSchemaRef = getSchemaRef(listMethodResponse.schema);
  if (!listSchemaRef) {
    resolvedListSchema = listMethodResponse.schema;
  } else {
    const listSchemaName = getSchemaNameFromRef(listSchemaRef);
    resolvedListSchema = resolveObject(oas, ['components', 'schemas', listSchemaName]);
  }

  // Ignore if the List method response is not found or not paginated
  if (!resolvedListSchema || !schemaIsPaginated(resolvedListSchema)) {
    return;
  }

  // Ignore if there is no matching Get method
  const getMethodResponseContentPerMediaType = getResponseOfGetMethodByMediaType(mediaType, resourcePath, oas);
  if (!getMethodResponseContentPerMediaType) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(
    path,
    resolvedListSchema.properties.results.items,
    getMethodResponseContentPerMediaType
  );

  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, listMethodResponse, path);
};

function checkViolationsAndReturnErrors(path, listMethodResultItems, getMethodResponseContent) {
  try {
    // Error if the Get method does not have a schema
    if (!getMethodResponseContent.schema) {
      return [
        {
          path,
          message: `Could not validate that the List method returns the same resource object as the Get method. The Get method does not have a schema.`,
        },
      ];
    }

    const listMethodSchemaRef = getSchemaRef(listMethodResultItems);
    const getMethodSchemaRef = getSchemaRef(getMethodResponseContent.schema);

    // Error if the Get method does not have a schema ref
    if (!getMethodSchemaRef) {
      return [
        {
          path,
          message: `Could not validate that the List method returns the same resource object as the Get method. The Get method does not have a schema reference.`,
        },
      ];
    }

    // Error if the get method resource is not the same as the list method resource
    if (getMethodSchemaRef !== listMethodSchemaRef) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
