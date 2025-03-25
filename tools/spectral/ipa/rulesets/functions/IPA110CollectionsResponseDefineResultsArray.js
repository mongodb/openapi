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
import { schemaIsPaginated } from './utils/schemaUtils.js';

const RULE_NAME = 'xgen-IPA-110-collections-use-paginated-schema';
const ERROR_MESSAGE = 'The response for collections must define an array of results containing the paginated resource.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  const mediaType = input;

  if (
    !mediaType.endsWith('json') ||
    !isResourceCollectionIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    return;
  }

  const listMethodResponse = resolveObject(oas, path);
  if (!listMethodResponse.schema) {
    return;
  }

  if (hasException(listMethodResponse, RULE_NAME)) {
    collectException(listMethodResponse, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(listMethodResponse.schema, oas, path);

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(listResponseSchema, oas, path) {
  try {
    if (!schemaIsPaginated(listResponseSchema)) {
      return [
        {
          path,
          message: `${ERROR_MESSAGE} The response should reference a schema that contains "results" (array) field.`,
        },
      ];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
