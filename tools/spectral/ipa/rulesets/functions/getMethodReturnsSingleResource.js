import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { hasException } from './utils/exceptions.js';
import { schemaIsArray, schemaIsPaginated } from './utils/schemaUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-104-get-method-returns-single-resource';
const ERROR_MESSAGE_STANDARD_RESOURCE =
  'Get methods should return data for a single resource. This method returns an array or a paginated response.';
const ERROR_MESSAGE_SINGLETON_RESOURCE =
  'Get methods for singleton resource should return data for a single resource. This method returns an array or a paginated response. If this is not a singleton resource, please implement all standard methods.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  const responseCode = path[4];
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);
  const contentPerMediaType = resolveObject(oas, path);

  const isSingleResource = isSingleResourceIdentifier(resourcePath);
  const isSingleton = isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths);

  if (
    !contentPerMediaType.schema ||
    !responseCode.startsWith('2') ||
    !input.endsWith('json') ||
    (!isSingleResource && !isSingleton)
  ) {
    return;
  }

  if (hasException(contentPerMediaType, RULE_NAME)) {
    collectException(contentPerMediaType, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(contentPerMediaType, path, isSingleton);

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  return collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(contentPerMediaType, path, isSingleton) {
  try {
    const schema = contentPerMediaType.schema;
    if (schemaIsPaginated(schema) || schemaIsArray(schema)) {
      return [
        {
          path,
          message: isSingleton ? ERROR_MESSAGE_SINGLETON_RESOURCE : ERROR_MESSAGE_STANDARD_RESOURCE,
        },
      ];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
