import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { checkForbiddenPropertyAttributesAndReturnErrors } from './utils/validations/checkForbiddenPropertyAttributesAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-107-update-method-request-has-no-readonly-fields';
const ERROR_MESSAGE = 'The Update method request object must not include input fields (readOnly properties).';

/**
 * Update method (PUT, PATCH) request objects must not include input fields (readOnly properties).
 *
 * @param {string} input - An update operation request content version
 * @param {object} _ - Unused
 * @param {{ path: string[], documentInventory: object}} context - The context object containing the path and document
 */
export default (input, _, { path, documentInventory }) => {
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

  if (hasException(requestContentPerMediaType, RULE_NAME)) {
    collectException(requestContentPerMediaType, RULE_NAME, path);
    return;
  }

  const errors = checkForbiddenPropertyAttributesAndReturnErrors(
    requestContentPerMediaType.schema,
    'readOnly',
    path,
    [],
    ERROR_MESSAGE
  );

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};
