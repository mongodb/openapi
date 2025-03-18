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
import { resolveObject } from './utils/componentUtils.js';
import { getSchemaRef } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object';
const ERROR_MESSAGE_SCHEMA_NAME = 'The response body schema must reference a schema with a Request suffix.';
const ERROR_MESSAGE_SCHEMA_REF = 'The response body schema is defined inline and must reference a predefined schema.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  const contentPerMediaType = resolveObject(oas, path);
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  const isResourceCollection = isResourceCollectionIdentifier(resourcePath) && !isSingletonResource(resourcePaths);
  if (
    isCustomMethodIdentifier(resourcePath) ||
    !isResourceCollection ||
    !input.endsWith('json') ||
    !contentPerMediaType.schema
  ) {
    return;
  }

  if (hasException(contentPerMediaType, RULE_NAME)) {
    collectException(contentPerMediaType, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(contentPerMediaType, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(contentPerMediaType, path) {
  try {
    const schema = contentPerMediaType.schema;
    const schemaRef = getSchemaRef(schema);

    if (!schemaRef) {
      return [{ path, message: ERROR_MESSAGE_SCHEMA_REF }];
    }
    if (!schemaRef.endsWith('Request')) {
      return [{ path, message: ERROR_MESSAGE_SCHEMA_NAME }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
