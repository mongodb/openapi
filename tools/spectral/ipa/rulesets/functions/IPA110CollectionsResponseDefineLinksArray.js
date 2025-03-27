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

const RULE_NAME = 'xgen-IPA-110-collections-response-define-links-array';
const ERROR_MESSAGE =
  'The response for collections should define a links array field, providing links to next and previous pages.';

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
    const hasLinksArray = listResponseSchema.properties?.links?.type === 'array';

    if (!hasLinksArray) {
      return [
        {
          path,
          message: `${ERROR_MESSAGE}`,
        },
      ];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
