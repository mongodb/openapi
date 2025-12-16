import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE =
  'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.';

export default (input, opts, { path, rule }) => {
  const ruleName = rule.name;
  // Ignore missing descriptions
  if (!input['description']) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(description, path, ruleName) {
  const tablePattern = new RegExp(`[|]\\s?:?\\s?-+\\s?:?\\s?[|]`);

  try {
    if (tablePattern.test(description)) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
