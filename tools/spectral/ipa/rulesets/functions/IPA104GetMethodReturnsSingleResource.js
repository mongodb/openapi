import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { schemaIsArray, schemaIsPaginated } from './utils/schemaUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const ERROR_MESSAGE_STANDARD_RESOURCE =
  'Get methods should return data for a single resource. This method returns an array or a paginated response.';
const ERROR_MESSAGE_SINGLETON_RESOURCE =
  'Get methods for singleton resource should return data for a single resource. This method returns an array or a paginated response. If this is not a singleton resource, please implement all standard methods.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  const responseCode = path[4];
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);
  const contentPerMediaType = resolveObject(oas, path);

  const isSingleResource = isSingleResourceIdentifier(resourcePath);
  const isSingleton = isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths);

  if (
    !responseCode.startsWith('2') ||
    !contentPerMediaType ||
    !contentPerMediaType.schema ||
    !input.endsWith('json') ||
    (!isSingleResource && !isSingleton)
  ) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(contentPerMediaType, path, isSingleton, ruleName);

  return evaluateAndCollectAdoptionStatus(errors, ruleName, contentPerMediaType, path);
};

function checkViolationsAndReturnErrors(contentPerMediaType, path, isSingleton, ruleName) {
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
    return handleInternalError(ruleName, path, e);
  }
}
