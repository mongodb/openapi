import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
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
  if (
    !input.endsWith('json') ||
    !isResourceCollectionIdentifier(resourcePath) ||
    (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(getResourcePathItems(resourcePath, oas.paths)))
  ) {
    return;
  }

  const listMethodResponse = resolveObject(oas, path);
  if (!listMethodResponse.schema) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(listMethodResponse.schema, oas, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, listMethodResponse, path);
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
