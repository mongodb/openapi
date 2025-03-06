import {
  isSingleResourceIdentifier,
  isSingletonResource,
  getResourcePathItems,
  isResourceCollectionIdentifier,
} from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { getSchemaRef } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-104-get-method-returns-response-suffixed-object';
const ERROR_MESSAGE_SCHEMA_NAME = 'The request schema must reference a schema with a Response suffix.';
const ERROR_MESSAGE_SCHEMA_REF = 'The response body schema is defined inline and must reference a predefined schema.';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const responseCode = path[4];
  const contentMediaType = path[path.length - 1];
  const oas = documentInventory.unresolved;
  const resourcePaths = getResourcePathItems(resourcePath, oas.paths);

  if (
    responseCode.startsWith('2') &&
    contentMediaType.endsWith('json') &&
    (isSingleResourceIdentifier(resourcePath) ||
      (isResourceCollectionIdentifier(resourcePath) && isSingletonResource(resourcePaths)))
  ) {
    const contentPerMediaType = resolveObject(oas, path);

    if (hasException(contentPerMediaType, RULE_NAME)) {
      collectException(contentPerMediaType, RULE_NAME, path);
      return;
    }

    if (contentPerMediaType.schema) {
      const schema = contentPerMediaType.schema;
      const schemaRef = getSchemaRef(schema);
      if (!schemaRef) {
        return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE_SCHEMA_REF);
      }
      if (!schemaRef.endsWith('Response')) {
        return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE_SCHEMA_NAME);
      }
      collectAdoption(path, RULE_NAME);
    }
  }
};
