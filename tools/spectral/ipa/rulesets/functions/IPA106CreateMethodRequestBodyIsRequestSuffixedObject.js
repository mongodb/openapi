import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { checkSchemaRefSuffixAndReturnErrors } from './utils/validations/checkSchemaRefSuffixAndReturnErrors.js';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
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

  const errors = checkSchemaRefSuffixAndReturnErrors(path, contentPerMediaType, 'Request', ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, contentPerMediaType, path);
};
