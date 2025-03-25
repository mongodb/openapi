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
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { getSchemaNameFromRef } from './utils/methodUtils.js';
import { schemaIsPaginated } from './utils/schemaUtils.js';

const RULE_NAME = 'xgen-IPA-110-collections-use-paginated-schema';
const ERROR_MESSAGE =
  'List methods must use a paginated response schema. The response should reference a schema with either a name starting with "Paginated" or contain both "totalCount" (integer) and "results" (array) fields.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const mediaType = input;

  if (
    !mediaType.endsWith('json') ||
    !isResourceCollectionIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    return;
  }

  // Ignore if the List method does not have a response schema
  const listMethodResponse = resolveObject(oas, path);

  if (!listMethodResponse || !listMethodResponse.schema) {
    return;
  }

  if (hasException(listMethodResponse, RULE_NAME)) {
    collectException(listMethodResponse, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(listMethodResponse, oas, path);

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(listMethodResponse, oas, path) {
  try {
    if (!listMethodResponse.schema.$ref) {
      return [
        {
          path,
          message:
            'The schema is defined inline and must reference a predefined schema with a name starting with "Paginated".',
        },
      ];
    }

    const schemaRef = listMethodResponse.schema.$ref;
    const schemaName = getSchemaNameFromRef(schemaRef);

    if (schemaName.startsWith('Paginated')) {
      return [];
    }

    const listResponseSchema = resolveObject(oas, ['components', 'schemas', schemaName]);
    if (!schemaIsPaginated(listResponseSchema)) {
      return [
        {
          path,
          message: ERROR_MESSAGE,
        },
      ];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
