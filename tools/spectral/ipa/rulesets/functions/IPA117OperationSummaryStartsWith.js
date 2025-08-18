import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { hasCustomMethodOverride } from './utils/extensions.js';

/**
 * Checks if the operation summary starts with one of the allowed verbs in the 'allowedStartVerbs' list. The rule ignores custom methods.
 * Note: This rule is used by multiple rules evaluating get/list, update, delete and create.
 * @param input the operation summary to evaluate
 * @param allowedStartVerbs the list of allowed verbs that the operation summary must start with
 * @param path the path to the operation object summary in the document
 * @param rule the rule object containing the rule name and other metadata
 * @param documentInventory the document inventory containing the resolved OAS document
 * @returns {Array<{path: Array<string>, message: string}>|undefined} error if the summary does not start with one of the allowed verbs, or undefined if there are no errors
 */
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
