import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { checkForbiddenPropertyAttributesAndReturnErrors } from './utils/validations/checkForbiddenPropertyAttributesAndReturnErrors.js';

const ERROR_MESSAGE = 'The Update method request object must not include input fields (readOnly properties).';

/**
 * Update method (PUT, PATCH) request objects must not include input fields (readOnly properties).
 *
 * @param {string} input - An update operation request content version
 * @param {object} _ - Unused
 * @param {{ path: string[], documentInventory: object}} context - The context object containing the path and document
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (
    !input.endsWith('json') ||
    (!isSingleResourceIdentifier(resourcePath) &&
      !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePathItems)))
  ) {
    return;
  }

  const requestContentPerMediaType = resolveObject(oas, path);
  if (!requestContentPerMediaType || !requestContentPerMediaType.schema) {
    return;
  }

  const errors = checkForbiddenPropertyAttributesAndReturnErrors(
    requestContentPerMediaType.schema,
    'readOnly',
    path,
    [],
    ERROR_MESSAGE
  );
  return evaluateAndCollectAdoptionStatus(errors, ruleName, requestContentPerMediaType, path);
};
