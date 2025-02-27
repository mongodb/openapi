import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-104-GET-response-code-should-be-200-OK';
const ERROR_MESSAGE = 'The HTTP response status code for GET operations should be 200 OK.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const getOperation = resolveObject(oas, path);
  if (hasException(getOperation, RULE_NAME)) {
    collectException(getOperation, RULE_NAME, path);
    return;
  }

  if (getOperation.responses) {
    const responses = getOperation.responses;
    if (!responses['200']) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  }
  console.log('adoption');
  collectAdoption(path, RULE_NAME);
};
