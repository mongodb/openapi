import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { isDeepEqual, removeReadOnlyProperties, removeWriteOnlyProperties } from './utils/compareUtils.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { getResponseOfGetMethodByMediaType } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-get-method-response';
const ERROR_MESSAGE =
  'The request body schema properties must match the response body schema properties of the Get method.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  let mediaType = input;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);
  if (isCustomMethodIdentifier(resourcePath) || !isResourceCollection || !mediaType.endsWith('json')) {
    return;
  }

  const getMethodResponseContentPerMediaType = getResponseOfGetMethodByMediaType(mediaType, resourcePath, oas);
  if (!getMethodResponseContentPerMediaType) {
    return;
  }

  const postMethodRequestContentPerMediaType = resolveObject(oas, path);
  if (!postMethodRequestContentPerMediaType.schema) {
    return;
  }
  if (hasException(postMethodRequestContentPerMediaType, RULE_NAME)) {
    collectException(postMethodRequestContentPerMediaType, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(
    path,
    postMethodRequestContentPerMediaType,
    getMethodResponseContentPerMediaType
  );

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(
  path,
  postMethodRequestContentPerMediaType,
  getMethodResponseContentPerMediaType
) {
  const errors = [];

  if (!getMethodResponseContentPerMediaType.schema) {
    return [
      {
        path,
        message: `Could not validate that the Create request body schema matches the response schema of the Get method. The Get method does not have a schema.`,
      },
    ];
  }

  // Create filtered versions of schemas by removing properties with appropriate flags
  const filteredCreateRequestSchema = removeWriteOnlyProperties(postMethodRequestContentPerMediaType);
  const filteredGetResponseSchema = removeReadOnlyProperties(getMethodResponseContentPerMediaType);

  if (!isDeepEqual(filteredCreateRequestSchema, filteredGetResponseSchema)) {
    errors.push({
      path,
      message: ERROR_MESSAGE,
    });
  }

  return errors;
}
