import {
  isSingleResourceIdentifier,
  isSingletonResource,
  getResourcePathItems,
  isResourceCollectionIdentifier,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { getSchemaRef } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-104-get-method-returns-response-suffixed-object';
const ERROR_MESSAGE_SCHEMA_NAME = 'The request schema must reference a schema with a Response suffix.';
const ERROR_MESSAGE_SCHEMA_REF = 'The response body schema is defined inline and must reference a predefined schema.';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const responseCode = path[4];
  const oas = documentInventory.unresolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);
  const contentPerMediaType = resolveObject(oas, path);

  if (
    !contentPerMediaType.schema ||
    !responseCode.startsWith('2') ||
    !input.endsWith('json') ||
    (!isSingleResourceIdentifier(resourcePath) &&
      !(isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths)))
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
    if (!schemaRef.endsWith('Response')) {
      return [{ path, message: ERROR_MESSAGE_SCHEMA_NAME }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
