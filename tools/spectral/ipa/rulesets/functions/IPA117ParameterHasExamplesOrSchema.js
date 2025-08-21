import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE = 'API producers must provide a well-defined schema or example(s) for parameters.';

export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(object, path, ruleName) {
  try {
    if (object['schema'] || object['example'] || object['examples']) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
