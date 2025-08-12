import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { checkSchemaRefSuffixAndReturnErrors } from './utils/validations/checkSchemaRefSuffixAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const contentPerMediaType = resolveObject(oas, path);
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);
  if (
    isCustomMethodIdentifier(resourcePath) ||
    !isResourceCollection ||
    !input.endsWith('json') ||
    !contentPerMediaType.schema
  ) {
    return;
  }

  const errors = checkSchemaRefSuffixAndReturnErrors(path, contentPerMediaType, 'Request', RULE_NAME);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, contentPerMediaType, path);
};
