import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { getSchemaRef } from './utils/methodUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object';
const ERROR_MESSAGE_SCHEMA_NAME = 'The response body schema must reference a schema with a Request suffix.';
const ERROR_MESSAGE_SCHEMA_REF = 'The response body schema is defined inline and must reference a predefined schema.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];

  if (isCustomMethodIdentifier(resourcePath)) {
    return;
  }

  const contentPerMediaType = resolveObject(oas, path);

  if (hasException(contentPerMediaType, RULE_NAME)) {
    collectException(contentPerMediaType, RULE_NAME, path);
    return;
  }

  if (contentPerMediaType.schema) {
    console.log(contentPerMediaType);
    const schema = contentPerMediaType.schema;
    const schemaName = getSchemaRef(schema);
    if (!schemaName) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE_SCHEMA_REF);
    }
    if (!schemaName.endsWith('Request')) {
      return collectAndReturnViolation(path, RULE_NAME, ERROR_MESSAGE_SCHEMA_NAME);
    }
    collectAdoption(path, RULE_NAME);
  }
};
