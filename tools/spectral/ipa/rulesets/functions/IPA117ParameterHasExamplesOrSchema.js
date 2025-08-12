import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-parameter-has-examples-or-schema';
const ERROR_MESSAGE = 'API producers must provide a well-defined schema or example(s) for parameters.';

export default (input, _, { path }) => {
  const errors = checkViolationsAndReturnErrors(input, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(object, path) {
  try {
    if (object['schema'] || object['example'] || object['examples']) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
