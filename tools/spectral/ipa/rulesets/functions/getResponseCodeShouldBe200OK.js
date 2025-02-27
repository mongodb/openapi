import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-104-GET-response-code-should-be-200-OK';
const ERROR_MESSAGE = 'The HTTP response status code for GET operations should be 200 OK.';

export default (input, _, { path }) => {
  console.log(input);

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  if (input['responses']) {
    const responses = input['responses'];
    if (!responses['200']) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  }
  console.log('adoption');
  collectAdoption(path, RULE_NAME);
};
