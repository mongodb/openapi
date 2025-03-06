import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-should-not-have-query-parameters';
const ERROR_MESSAGE = 'Create operations should not have query parameters.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];

  if (isCustomMethodIdentifier(resourcePath)) {
    return;
  }

  const postMethod = resolveObject(oas, path);
  if (!postMethod.parameters || postMethod.parameters.length === 0) {
    return;
  }

  if (hasException(postMethod, RULE_NAME)) {
    collectException(postMethod, RULE_NAME, path);
    return;
  }

  for (const parameter of postMethod.parameters) {
    if (parameter.in === 'query') {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  }

  collectAdoption(path, RULE_NAME);
};
