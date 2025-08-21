import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

export default (input, { preferredWords, forbiddenWords }, { path, rule, documentInventory }) => {
  const operationObjectPath = path.slice(0, -1);
  const operationObject = resolveObject(documentInventory.resolved, operationObjectPath);

  const errors = checkViolationsAndReturnErrors(input, preferredWords, forbiddenWords, operationObjectPath, rule.name);
  return evaluateAndCollectAdoptionStatus(errors, rule.name, operationObject, operationObjectPath);
};

function checkViolationsAndReturnErrors(summary, preferredWords, forbiddenWords, path, ruleName) {
  try {
    const errors = [];
    const words = summary.toLowerCase().split(' ');

    forbiddenWords.forEach((forbiddenWord) => {
      words.forEach((word) => {
        if (word === forbiddenWord) {
          if (preferredWords.length === 1) {
            errors.push({
              path,
              message: `Operation summary referring to a single item must use "${preferredWords[0]}" instead of "${forbiddenWord}".`,
            });
          } else {
            errors.push({
              path,
              message: `Operation summary referring to a single item must use one of the words [${preferredWords}] instead of ${forbiddenWords}.`,
            });
          }
        }
      });
    });

    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
