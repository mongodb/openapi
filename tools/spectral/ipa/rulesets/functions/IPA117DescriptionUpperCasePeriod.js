import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-description-uppercase-period';
const ERROR_MESSAGE_PERIOD = 'Descriptions must end with a full stop(.).';
const ERROR_MESSAGE_UPPER_CASE = 'Descriptions must start with Uppercase.';

export default (input, opts, { path }) => {
  if (!input['description']) {
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
  const upperCaseStart = new RegExp(`^[A-Z]`);
  const periodEnd = new RegExp(`[.]$`);
  const errors = [];

  try {
    if (!upperCaseStart.test(description)) {
      errors.push({ path, message: ERROR_MESSAGE_UPPER_CASE });
    }
    if (!periodEnd.test(description)) {
      errors.push({ path, message: ERROR_MESSAGE_PERIOD });
    }
    return errors;
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
