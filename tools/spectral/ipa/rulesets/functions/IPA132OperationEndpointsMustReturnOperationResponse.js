import { resolveObject } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getSchemaNameFromRef } from './utils/methodUtils.js';
import {
  isOperationsCollectionPath,
  isSingleOperationPath,
  OPERATION_RESPONSE_SCHEMA_NAME,
} from './utils/longRunningOperations.js';

const SINGLE_OPERATION_ERROR_MESSAGE = `The Operation endpoint must return the ${OPERATION_RESPONSE_SCHEMA_NAME} schema.`;
const OPERATIONS_COLLECTION_ERROR_MESSAGE = `The Operations collection endpoint must return a paginated response whose results reference the ${OPERATION_RESPONSE_SCHEMA_NAME} schema.`;

/**
 * Checks that Operations endpoints defined by IPA-132 return the OperationResponse schema: the
 * single Operation endpoint must reference it directly, and the Operations collection endpoint
 * must reference a paginated wrapper schema whose results items reference it.
 *
 * @param {string} input - The media type from the response content of the GET method
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const responseCode = path[4];

  if (
    !responseCode.startsWith('2') ||
    !input.endsWith('json') ||
    (!isSingleOperationPath(resourcePath) && !isOperationsCollectionPath(resourcePath))
  ) {
    return;
  }

  const oas = documentInventory.unresolved;
  const contentPerMediaType = resolveObject(oas, path);
  if (!contentPerMediaType || !contentPerMediaType.schema) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(resourcePath, contentPerMediaType.schema, oas, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, contentPerMediaType, path);
};

function checkViolationsAndReturnErrors(resourcePath, schema, oas, path, ruleName) {
  try {
    if (isSingleOperationPath(resourcePath)) {
      if (schemaReferencesOperationResponse(schema)) {
        return [];
      }
      return [{ path, message: SINGLE_OPERATION_ERROR_MESSAGE }];
    }

    // The Operations collection response must reference a paginated wrapper schema, since inline
    // paginated schemas are rejected by xgen-IPA-110-collections-use-paginated-prefix
    const wrapperSchema = getReferencedSchema(schema, oas);
    const resultsItems = getResultsItems(wrapperSchema);
    if (resultsItems && schemaReferencesOperationResponse(resultsItems)) {
      return [];
    }
    return [{ path, message: OPERATIONS_COLLECTION_ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}

function schemaReferencesOperationResponse(schema) {
  return schema.$ref !== undefined && getSchemaNameFromRef(schema.$ref) === OPERATION_RESPONSE_SCHEMA_NAME;
}

function getReferencedSchema(schema, oas) {
  if (!schema.$ref) {
    return undefined;
  }
  return oas.components?.schemas?.[getSchemaNameFromRef(schema.$ref)];
}

/**
 * Finds the results items schema of a paginated wrapper. The results property may be defined
 * directly on the wrapper, or within one of its allOf sub-schemas, which Spectral does not flatten.
 */
function getResultsItems(wrapperSchema) {
  if (!wrapperSchema) {
    return undefined;
  }
  const directItems = wrapperSchema.properties?.results?.items;
  if (directItems) {
    return directItems;
  }
  for (const subSchema of wrapperSchema.allOf ?? []) {
    const items = subSchema.properties?.results?.items;
    if (items) {
      return items;
    }
  }
  return undefined;
}
