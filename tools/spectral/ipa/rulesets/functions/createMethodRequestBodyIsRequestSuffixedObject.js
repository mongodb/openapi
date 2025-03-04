import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { isCustomMethod } from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object';
const ERROR_MESSAGE = 'Response body for the Create method should refer to Request suffixed schema.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];

  if (isCustomMethod(resourcePath)) {
    return;
  }

  const contentPerMediaType = resolveObject(oas, path);

  if (hasException(contentPerMediaType, RULE_NAME)) {
    collectException(contentPerMediaType, RULE_NAME, path);
    return;
  }

  if (contentPerMediaType.schema) {
    const schema = contentPerMediaType.schema;
    if (schema.$ref && !schema.$ref.endsWith('Request')) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
    if(!schema.$ref) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  }

  collectAdoption(path, RULE_NAME);
};
