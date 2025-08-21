import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'includeCount query parameter of List method must not be required.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const resourcePath = path[1];

  if (
    !isResourceCollectionIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    return;
  }

  const includeCountParam = input?.parameters?.find((p) => p.name === 'includeCount' && p.in === 'query');
  if (!includeCountParam) {
    return;
  }

  let errors = [];
  if (includeCountParam.required) {
    errors = [
      {
        path,
        message: ERROR_MESSAGE,
      },
    ];
  }
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};
