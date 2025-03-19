import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { getResponseOfGetMethodByMediaType } from './utils/methodUtils.js';
import { checkRequestResponseResourceEqualityAndReturnErrors } from './utils/validations.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-get-method-response';
const ERROR_MESSAGE =
  'The request body schema properties must match the response body schema properties of the Get method.';

/**
 * Create method request body schema properties must match the response body schema properties of the Get method.
 *
 * @param {string} input - A create operation request content version
 * @param {object} _ - Unused
 * @param {{ path: string[], documentInventory: object}} context - The context object containing the path and document
 */
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

  const errors = checkRequestResponseResourceEqualityAndReturnErrors(
    path,
    postRequestContentPerMediaType,
    getResponseContentPerMediaType,
    postRequestContentPerMediaTypeUnresolved,
    getResponseContentPerMediaTypeUnresolved,
    'Create',
    'Get',
    ERROR_MESSAGE
  );

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};
