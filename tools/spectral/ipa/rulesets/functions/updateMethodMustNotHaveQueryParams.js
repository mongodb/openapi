import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';

const ERROR_MESSAGE = 'Update operations must not have query parameters.';

/**
 * Update operations must not have query parameters.
 *
 * @param {object} input - The update operation object
 * @param {{ignoredValues: string[]}} opts - Array of ignored query parameters
 * @param {object} context - The context object containing the path, document and rule
 */
export default (input, opts, { path, documentInventory, rule }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (
    !isSingleResourceIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePathItems))
  ) {
    return;
  }

  if (!input.parameters || input.parameters.length === 0) {
    return;
  }

  if (hasException(input, rule)) {
    collectException(input, rule, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input.parameters, path, rule, opts);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, rule, errors);
  }
  collectAdoption(path, rule);
};

function checkViolationsAndReturnErrors(postMethodParameters, path, rule, opts) {
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
    handleInternalError(rule, path, e);
  }
}
