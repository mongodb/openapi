import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-description-ends-with-period';
const ERROR_MESSAGE_PERIOD = 'Descriptions must end with a full stop(.).';

export default (input, opts, { path }) => {
  // Ignore missing descriptions or descriptions that ends with an inline table
  if (!input['description'] || input['description'].endsWith('|') || input['description'].endsWith('|\n')) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(description, path) {
  const periodEnd = new RegExp(`[.]$`);

  try {
    if (!periodEnd.test(description)) {
      return [{ path, message: ERROR_MESSAGE_PERIOD }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
