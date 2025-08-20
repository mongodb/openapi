import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-description-ends-with-period';
const ERROR_MESSAGE_PERIOD = 'Descriptions must end with a full stop(.).';

export default (input, opts, { path }) => {
  // Ignore missing descriptions or descriptions that ends with an inline table
  if (!input['description'] || input['description'].endsWith('|') || input['description'].endsWith('|\n')) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(description, path) {
  const periodEnd = new RegExp(`[.]$`);

  try {
    if (!periodEnd.test(description)) {
      return [{ path, message: ERROR_MESSAGE_PERIOD }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
