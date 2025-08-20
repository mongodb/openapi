import {
  evaluateAndCollectAdoptionStatus,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-description-starts-with-uppercase';
const ERROR_MESSAGE_UPPER_CASE = 'Descriptions must start with Uppercase.';

export default (input, opts, { path }) => {
  if (!input['description']) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(description, path) {
  const upperCaseStart = new RegExp(`^[A-Z]`);

  try {
    if (!upperCaseStart.test(description)) {
      return [{ path, message: ERROR_MESSAGE_UPPER_CASE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
