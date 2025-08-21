import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { schemaIsPaginated } from './utils/schemaUtils.js';

const ERROR_MESSAGE = 'The response for collections must define an array of results containing the paginated resource.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  if (
    !input.endsWith('json') ||
    !isResourceCollectionIdentifier(resourcePath) ||
    isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
  ) {
    return;
  }

  const listMethodResponse = resolveObject(oas, path);
  if (!listMethodResponse.schema) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(listMethodResponse.schema, oas, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, listMethodResponse, path);
};

function checkViolationsAndReturnErrors(listResponseSchema, oas, path, ruleName) {
  try {
    if (!schemaIsPaginated(listResponseSchema)) {
      return [
        {
          path,
          message: `${ERROR_MESSAGE}`,
        },
      ];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
