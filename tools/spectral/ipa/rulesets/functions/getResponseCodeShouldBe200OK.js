import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-104-GET-response-code-should-be-200-OK';
const ERROR_MESSAGE = 'GET method response code should be 200 OK.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;

  if (hasException(oas.paths[input], RULE_NAME)) {
    collectException(oas.paths[input], RULE_NAME, path);
    return;
  }

  let pathItem = oas.paths[input];
  if (!pathItem.get) {
    return;
  }

  if (pathItem.get && pathItem.get.responses) {
    const responses = pathItem.get.responses;
    if (!responses['200']) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  }

  collectAdoption(path, RULE_NAME);
};
