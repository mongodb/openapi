import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { checkForbiddenPropertyAttributesAndReturnErrors } from './utils/validations/checkForbiddenPropertyAttributesAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-has-no-readonly-fields';
const ERROR_MESSAGE = 'The Create method request object must not include input fields (readOnly properties).';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);
  let mediaType = input;

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);

  if (isCustomMethodIdentifier(resourcePath) || !isResourceCollection || !mediaType.endsWith('json')) {
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
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, requestContentPerMediaType, path);
};
