import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import {
  getResponseOfListMethodByMediaType,
  getResponseOfGetMethodByMediaType,
  getSchemaRef,
  getSchemaNameFromRef,
} from './utils/methodUtils.js';
import { schemaIsPaginated } from './utils/schemaUtils.js';

const RULE_NAME = 'xgen-IPA-105-list-method-response-is-get-method-response';
const ERROR_MESSAGE =
  'The schema of each result in the List method response must be the same schema as the response of the Get method.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const responseCode = path[4];
  const mediaType = input;

  if (
    responseCode !== '200' ||
    !mediaType.endsWith('json') ||
    !isResourceCollectionIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    return;
  }

  // Ignore if the List method does not have a response schema
  const listMethodResponse = getResponseOfListMethodByMediaType(mediaType, resourcePath, oas);
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

  // Ignore if there is no matching Get method response, or if it does not have a schema
  const getMethodRequestContentPerMediaType = getResponseOfGetMethodByMediaType(mediaType, resourcePath, oas);
  if (!getMethodRequestContentPerMediaType || !getMethodRequestContentPerMediaType.schema) {
    return;
  }

  if (hasException(listMethodResponse, RULE_NAME)) {
    collectException(listMethodResponse, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(
    path,
    resolvedListSchema.properties.results.items,
    getMethodRequestContentPerMediaType.schema
  );

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(path, listMethodResultItemsSchema, getMethodSchema) {
  const listMethodSchemaRef = getSchemaRef(listMethodResultItemsSchema);
  const getMethodSchemaRef = getSchemaRef(getMethodSchema);

  if (getMethodSchemaRef !== listMethodSchemaRef) {
    return [{ path, message: ERROR_MESSAGE }];
  }
  return [];
}
