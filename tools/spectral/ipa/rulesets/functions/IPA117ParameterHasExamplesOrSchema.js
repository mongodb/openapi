import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-parameter-has-examples-or-schema';
const ERROR_MESSAGE = 'API producers must provide a well-defined schema or example(s) for parameters.';

export default (input, _, { path }) => {
  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(object, path) {
  try {
    if (object['schema'] || object['example'] || object['examples']) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
