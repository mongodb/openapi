import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { getSchemaNameFromRef } from './utils/methodUtils.js';

const ERROR_MESSAGE = 'List methods response must reference a paginated response schema.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  if (
    !input.endsWith('json') ||
    !isResourceCollectionIdentifier(resourcePath) ||
    isSingletonResource(getResourcePathItems(resourcePath, oas.paths))
  ) {
    return;
  }

  const listMethodResponse = resolveObject(oas, path);

  const errors = checkViolationsAndReturnErrors(listMethodResponse, oas, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, listMethodResponse, path);
};

function checkViolationsAndReturnErrors(listMethodResponse, oas, path, ruleName) {
  try {
    if (!listMethodResponse.schema) {
      return [
        {
          path,
          message: `${ERROR_MESSAGE} The List method response does not have a schema defined.`,
        },
      ];
    }

    if (!listMethodResponse.schema.$ref) {
      return [
        {
          path,
          message: `${ERROR_MESSAGE} The schema is defined inline and must reference a predefined paginated schema.`,
        },
      ];
    }

    const schemaRef = listMethodResponse.schema.$ref;
    const schemaName = getSchemaNameFromRef(schemaRef);

    if (!schemaName.startsWith('Paginated')) {
      return [
        {
          path,
          message: `${ERROR_MESSAGE} The response should reference a schema with "Paginated" prefix.`,
        },
      ];
    }

    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
