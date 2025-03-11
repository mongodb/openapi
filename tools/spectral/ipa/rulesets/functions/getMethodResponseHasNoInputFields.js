import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';

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

  if (hasException(contentPerMediaType, RULE_NAME)) {
    collectException(contentPerMediaType, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(contentPerMediaType, path);

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  return collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(contentPerMediaType, path) {
  const schema = contentPerMediaType.schema;
  const properties = schema.properties;
  if (properties) {
    for (const [value] of Object.entries(properties)) {
      if (properties[value].writeOnly) {
        return [{ path, message: ERROR_MESSAGE }];
      }
    }
  }
  return [];
}
