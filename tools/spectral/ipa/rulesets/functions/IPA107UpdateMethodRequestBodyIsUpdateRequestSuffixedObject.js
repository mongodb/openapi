import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
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

  if (hasException(contentPerMediaType, RULE_NAME)) {
    collectException(contentPerMediaType, RULE_NAME, path);
    return;
  }

  const errors = checkSchemaRefSuffixAndReturnErrors(path, contentPerMediaType, 'UpdateRequest', RULE_NAME);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};
