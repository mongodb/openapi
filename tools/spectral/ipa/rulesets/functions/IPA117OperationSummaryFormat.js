import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isTitleCase } from './utils/casing.js';
import { resolveObject } from './utils/componentUtils.js';

export default (input, { ignoreList, grammaticalWords }, { path, rule, documentInventory }) => {
  const operationObjectPath = path.slice(0, -1);
  const operationObject = resolveObject(documentInventory.resolved, operationObjectPath);
  const errors = checkViolationsAndReturnErrors(input, ignoreList, grammaticalWords, operationObjectPath, rule.name);
  return evaluateAndCollectAdoptionStatus(errors, rule.name, operationObject, operationObjectPath);
};

function checkViolationsAndReturnErrors(summary, ignoreList, grammaticalWords, path, ruleName) {
  try {
    if (!isTitleCase(summary, ignoreList, grammaticalWords)) {
      return [
        {
          path,
          message: `Operation summaries must be in Title Case, must not end with a period and must not use CommonMark.`,
        },
      ];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
