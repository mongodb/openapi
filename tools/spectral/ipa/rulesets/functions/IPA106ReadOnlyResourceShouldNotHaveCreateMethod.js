import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isReadOnlyResource,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { hasException } from './utils/exceptions.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE = 'Read-only resources must not define the Create method.';
const REQUEST_BODY_PARITY_RULE = 'xgen-IPA-106-create-method-request-body-is-get-method-response';

export default (input, opts, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);
  if (isCustomMethodIdentifier(resourcePath) || !isResourceCollection) {
    return;
  }

  if (!isReadOnlyResource(resourcePaths)) {
    return;
  }

  // An exception for request body parity means the Create method takes input that is not in the GET response,
  // so the resource is managed through Create and is not a true read-only resource
  if (hasRequestBodyParityException(resourcePaths[resourcePath].post)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

// The exception is placed on the request body content version, which is what the parity rule evaluates
function hasRequestBodyParityException(postOperation) {
  const content = postOperation?.requestBody?.content;
  return Object.values(content ?? {}).some(
    (mediaTypeObject) => mediaTypeObject && hasException(mediaTypeObject, REQUEST_BODY_PARITY_RULE)
  );
}

function checkViolationsAndReturnErrors(path, ruleName) {
  try {
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
