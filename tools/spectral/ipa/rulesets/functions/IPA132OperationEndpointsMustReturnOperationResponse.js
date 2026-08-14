import { resolveObject } from './utils/componentUtils.js';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getSchemaNameFromRef, getSchemaRef } from './utils/methodUtils.js';
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
 * must return a paginated response whose results items reference it.
 *
 * @param {string} input - The media type from the response content of the GET method
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const responseCode = path[4];
  const oas = documentInventory.unresolved;
  const contentPerMediaType = resolveObject(oas, path);

  if (
    !responseCode.startsWith('2') ||
    !contentPerMediaType ||
    !contentPerMediaType.schema ||
    !input.endsWith('json') ||
    (!isSingleOperationPath(resourcePath) && !isOperationsCollectionPath(resourcePath))
  ) {
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

    // The Operations collection response may reference a paginated wrapper schema, or define the
    // paginated wrapper inline; the results items must reference the Operation schema either way
    const wrapperSchema = getReferencedSchema(schema, oas) ?? schema;
    const resultsItems = wrapperSchema?.properties?.results?.items;
    if (resultsItems && schemaReferencesOperationResponse(resultsItems)) {
      return [];
    }
    return [{ path, message: OPERATIONS_COLLECTION_ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}

function schemaReferencesOperationResponse(schema) {
  const schemaRef = getSchemaRef(schema);
  return schemaRef !== undefined && getSchemaNameFromRef(schemaRef) === OPERATION_RESPONSE_SCHEMA_NAME;
}

function getReferencedSchema(schema, oas) {
  const schemaRef = schema.$ref;
  if (!schemaRef) {
    return undefined;
  }
  return oas.components?.schemas?.[getSchemaNameFromRef(schemaRef)];
}
