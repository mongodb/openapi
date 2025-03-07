import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
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

  for (const parameter of postMethod.parameters) {
    if (parameter.in === 'query' && !ignoredParameters.includes(parameter.name)) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE);
    }
  }

  collectAdoption(path, RULE_NAME);
};
