import {
  getResourcePathItems,
  hasGetMethod,
  isResourceCollectionIdentifier,
  isSingletonResource,
} from './utils/resourceEvaluation.js';
import { getAllSuccessfulResponseSchemas } from './utils/methodUtils.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-113-singleton-must-not-have-id';
const ERROR_MESSAGE = 'Singleton resources must not have a user-provided or system-generated ID.';

export default (input, opts, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const resourcePath = path[1];
  const resourcePathItems = getResourcePathItems(resourcePath, oas.paths);

  if (!(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePathItems))) {
    return;
  }

  if (!hasGetMethod(input)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function schemaHasIdProperty(schema) {
  if (Object.keys(schema).includes('properties')) {
    const propertyNames = Object.keys(schema['properties']);
    return propertyNames.includes('id') || propertyNames.includes('_id');
  }
  return false;
}

function checkViolationsAndReturnErrors(input, path) {
  try {
    const resourceSchemas = getAllSuccessfulResponseSchemas(input['get']);
    if (resourceSchemas.some(({ schema }) => schemaHasIdProperty(schema))) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
