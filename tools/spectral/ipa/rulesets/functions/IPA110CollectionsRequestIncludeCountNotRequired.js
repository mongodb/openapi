import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-110-collections-request-includeCount-not-required';
const ERROR_MESSAGE = 'includeCount query parameter of List method must not be required.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];

  if (
    !isResourceCollectionIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const includeCountParam = input?.parameters?.find((p) => p.name === 'includeCount' && p.in === 'query');
  if (!includeCountParam) {
    return;
  }

  if (includeCountParam.required) {
    return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
  }

  collectAdoption(path, RULE_NAME);
};
