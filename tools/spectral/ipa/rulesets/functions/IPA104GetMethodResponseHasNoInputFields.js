import { collectExceptionAdoptionViolations } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { checkForbiddenPropertyAttributesAndReturnErrors } from './utils/validations/checkForbiddenPropertyAttributesAndReturnErrors.js';

const RULE_NAME = 'xgen-IPA-104-get-method-response-has-no-input-fields';
const ERROR_MESSAGE = 'The get method response object must not include output fields (writeOnly properties).';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const responseCode = path[4];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);
  const contentPerMediaType = resolveObject(oas, path);

  if (
    !responseCode.startsWith('2') ||
    !contentPerMediaType ||
    !contentPerMediaType.schema ||
    !input.endsWith('json') ||
    (!isSingleResourceIdentifier(resourcePath) &&
      !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths)))
  ) {
    return;
  }

  const errors = checkForbiddenPropertyAttributesAndReturnErrors(
    contentPerMediaType.schema,
    'writeOnly',
    path,
    [],
    ERROR_MESSAGE
  );

  return collectExceptionAdoptionViolations(errors, RULE_NAME, contentPerMediaType, path);
};
