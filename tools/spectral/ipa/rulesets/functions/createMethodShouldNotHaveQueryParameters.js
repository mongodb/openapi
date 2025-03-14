import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isCustomMethodIdentifier,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const RULE_NAME = 'xgen-IPA-106-create-method-should-not-have-query-parameters';
const ERROR_MESSAGE = 'Create operations should not have query parameters.';

/**
 * Create operations should not have query parameters.
 *
 * @param {object} input - The create operation object
 * @param {{ignoredValues: string[]}} opts - Array of ignored query parameters
 * @param {object} context - The context object containing the path and document
 */
export default (input, opts, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);
  if (isCustomMethodIdentifier(resourcePath) || !isResourceCollection) {
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

  const errors = checkViolationsAndReturnErrors(postMethod.parameters, path, opts);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(postMethodParameters, path, opts) {
  const errors = [];
  try {
    const ignoredValues = opts?.ignoredValues || [];

    for (const parameter of postMethodParameters) {
      if (parameter.in === 'query' && !ignoredValues.includes(parameter.name)) {
        errors.push({
          path: path,
          message: `${ERROR_MESSAGE}. Found [${parameter.name}] `,
        });
      }
    }
    return errors;
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
