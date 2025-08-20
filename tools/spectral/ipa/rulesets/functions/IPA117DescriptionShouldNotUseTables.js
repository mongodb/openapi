import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-description-should-not-use-inline-tables';
const ERROR_MESSAGE =
  'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.';

export default (input, opts, { path }) => {
  // Ignore missing descriptions
  if (!input['description']) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(description, path) {
  const tablePattern = new RegExp(`[|]:?-+:?[|]`);

  try {
    if (tablePattern.test(description)) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
