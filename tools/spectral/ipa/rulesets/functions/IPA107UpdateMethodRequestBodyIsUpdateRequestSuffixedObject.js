import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { checkSchemaRefSuffixAndReturnErrors } from './utils/validations/checkSchemaRefSuffixAndReturnErrors.js';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const contentPerMediaType = resolveObject(oas, path);
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (
    !input.endsWith('json') ||
    !contentPerMediaType.schema ||
    (!isSingleResourceIdentifier(resourcePath) &&
      !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePathItems)))
  ) {
    return;
  }

  const errors = checkSchemaRefSuffixAndReturnErrors(path, contentPerMediaType, 'UpdateRequest', ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, contentPerMediaType, path);
};
