import { getResponseOfGetMethodByMediaType, isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { compareSchemas } from './utils/schemaUtils.js';
import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-get-method-response';
const ERROR_MESSAGE = 'The request body schema properties must match the response body schema properties of the Get method.';


export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];

  if (isCustomMethodIdentifier(resourcePath)) {
    return;
  }

  const contentPerMediaType = resolveObject(oas, path);

  if (hasException(contentPerMediaType, RULE_NAME)) {
    collectException(contentPerMediaType, RULE_NAME, path);
    return;
  }

  let mediaType = input;
  const getMethodResponseContentPerMediaType = getResponseOfGetMethodByMediaType(mediaType, resourcePath, oas);
  if (!getMethodResponseContentPerMediaType) {
    return;
  }

  const postMethodRequestContentPerMediaType = resolveObject(oas, path);
  if (compareSchemas(postMethodRequestContentPerMediaType.schema, getMethodResponseContentPerMediaType.schema)) {
    collectAdoption(path, RULE_NAME);
  }
  return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
};
