import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE_UPPER_CASE = 'Descriptions must start with Uppercase.';

export default (input, opts, { path, rule }) => {
  const ruleName = rule.name;
  if (!input['description']) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(description, path, ruleName) {
  const upperCaseStart = new RegExp(`^[A-Z]`);

  try {
    if (!upperCaseStart.test(description)) {
      return [{ path, message: ERROR_MESSAGE_UPPER_CASE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
