import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { isTitleCase } from './utils/casing.js';
import { resolveObject } from './utils/componentUtils.js';
import { GRAMMATICAL_WORDS, IGNORE_LIST } from './utils/grammaticalWordsAndIgnoreList.js';

export default (input, _, { path, rule, documentInventory }) => {
  const operationObjectPath = path.slice(0, -1);
  const operationObject = resolveObject(documentInventory.resolved, operationObjectPath);
  const errors = checkViolationsAndReturnErrors(input, operationObjectPath, rule.name);
  return evaluateAndCollectAdoptionStatus(errors, rule.name, operationObject, operationObjectPath);
};

function checkViolationsAndReturnErrors(summary, path, ruleName) {
  try {
    if (!isTitleCase(summary, IGNORE_LIST, GRAMMATICAL_WORDS)) {
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
