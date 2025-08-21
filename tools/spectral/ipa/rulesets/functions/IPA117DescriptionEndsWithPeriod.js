import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE_PERIOD = 'Descriptions must end with a full stop(.).';

export default (input, opts, { path, rule }) => {
  const ruleName = rule.name;
  // Ignore missing descriptions or descriptions that ends with an inline table
  if (!input['description'] || input['description'].endsWith('|') || input['description'].endsWith('|\n')) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(description, path, ruleName) {
  const periodEnd = new RegExp(`[.]$`);

  try {
    if (!periodEnd.test(description)) {
      return [{ path, message: ERROR_MESSAGE_PERIOD }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
