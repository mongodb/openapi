import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { checkSchemaRefSuffixAndReturnErrors } from './utils/validations/checkSchemaRefSuffixAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object';

export default (input, _, { path, documentInventory }) => {
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

  const errors = checkSchemaRefSuffixAndReturnErrors(path, contentPerMediaType, 'UpdateRequest', RULE_NAME);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, contentPerMediaType, path);
};
