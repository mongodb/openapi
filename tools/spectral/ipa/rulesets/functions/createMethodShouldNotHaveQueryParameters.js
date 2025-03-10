import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-106-create-method-should-not-have-query-parameters';
const ERROR_MESSAGE = 'Create operations should not have query parameters.';

const ignoredParameters = ['envelope', 'pretty'];

export default (input, _, { path }) => {
  const resourcePath = path[1];

  if (isCustomMethodIdentifier(resourcePath)) {
    return;
  }

  const postMethod = input;
  if (!postMethod.parameters || postMethod.parameters.length === 0) {
    return;
  }

  if (hasException(postMethod, RULE_NAME)) {
    collectException(postMethod, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(postMethod.parameters, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(postMethodParameters, path) {
  const errors = [];
  try {
    for (const parameter of postMethodParameters) {
      if (parameter.in === 'query' && !ignoredParameters.includes(parameter.name)) {
        errors.push({
          path: path,
          message: `Input parameter [${parameter.name}]: ${ERROR_MESSAGE}`,
        });
      }
    }
    return errors;
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
