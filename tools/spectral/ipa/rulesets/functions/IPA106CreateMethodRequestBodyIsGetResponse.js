import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { isDeepEqual, removeRequestProperties, removeResponseProperties } from './utils/compareUtils.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { getResponseOfGetMethodByMediaType, getSchemaRef } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-get-method-response';
const ERROR_MESSAGE =
  'The request body schema properties must match the response body schema properties of the Get method.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const unresolvedOas = documentInventory.unresolved;
  const resourcePath = path[1];
  let mediaType = input;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);
  if (isCustomMethodIdentifier(resourcePath) || !isResourceCollection || !mediaType.endsWith('json')) {
    return;
  }

  const getResponseContentPerMediaType = getResponseOfGetMethodByMediaType(mediaType, resourcePath, oas);
  if (!getResponseContentPerMediaType) {
    return;
  }

  const postRequestContentPerMediaType = resolveObject(oas, path);
  if (!postRequestContentPerMediaType.schema) {
    return;
  }

  if (hasException(postRequestContentPerMediaType, RULE_NAME)) {
    collectException(postRequestContentPerMediaType, RULE_NAME, path);
    return;
  }

  const postRequestContentPerMediaTypeUnresolved = resolveObject(unresolvedOas, path);
  const getResponseContentPerMediaTypeUnresolved = getResponseOfGetMethodByMediaType(
    mediaType,
    resourcePath,
    unresolvedOas
  );

  const errors = checkViolationsAndReturnErrors(
    path,
    postRequestContentPerMediaType,
    getResponseContentPerMediaType,
    postRequestContentPerMediaTypeUnresolved,
    getResponseContentPerMediaTypeUnresolved
  );

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(
  path,
  postRequestContentPerMediaType,
  getResponseContentPerMediaType,
  postRequestContentPerMediaTypeUnresolved,
  getResponseContentPerMediaTypeUnresolved
) {
  const errors = [];

  if (!getResponseContentPerMediaType.schema) {
    return [
      {
        path,
        message: `Could not validate that the Create request body schema matches the response schema of the Get method. The Get method does not have a schema.`,
      },
    ];
  }

  const postRequestSchemaRef = getSchemaRef(postRequestContentPerMediaTypeUnresolved.schema);
  const getResponseSchemaRef = getSchemaRef(getResponseContentPerMediaTypeUnresolved.schema);

  if (postRequestSchemaRef && getResponseSchemaRef) {
    if (postRequestSchemaRef === getResponseSchemaRef) {
      return [];
    }
  }

  const filteredCreateRequestSchema = removeRequestProperties(postRequestContentPerMediaType.schema);
  const filteredGetResponseSchema = removeResponseProperties(getResponseContentPerMediaType.schema);

  if (!isDeepEqual(filteredCreateRequestSchema, filteredGetResponseSchema)) {
    errors.push({
      path,
      message: ERROR_MESSAGE,
    });
  }

  return errors;
}
