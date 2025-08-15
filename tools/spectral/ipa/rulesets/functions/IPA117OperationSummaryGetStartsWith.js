import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride } from './utils/extensions.js';

export default (input, { allowedStartVerbs }, { path, rule, documentInventory }) => {
  const resourcePath = path[1];
  const operationObjectPath = path.slice(0, -1);
  const operationObject = resolveObject(documentInventory.resolved, operationObjectPath);

  if (isCustomMethodIdentifier(resourcePath) || hasCustomMethodOverride(operationObject)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, allowedStartVerbs, operationObjectPath, rule.name);
  return evaluateAndCollectAdoptionStatus(errors, rule.name, operationObject, operationObjectPath);
};

function checkViolationsAndReturnErrors(summary, allowedStartVerbs, path, ruleName) {
  try {
    const firstWord = summary.split(' ')[0];

    if (!allowedStartVerbs.includes(firstWord)) {
      if (allowedStartVerbs.length === 1) {
        return [
          {
            path,
            message: `Operation summary must start with the word "${allowedStartVerbs[0]}".`,
          },
        ];
      } else {
        return [
          {
            path,
            message: `Operation summary must start with one of the words [${allowedStartVerbs}].`,
          },
        ];
      }
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
