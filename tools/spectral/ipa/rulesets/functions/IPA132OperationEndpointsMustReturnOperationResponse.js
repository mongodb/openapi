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
const MISSING_SCHEMA_ERROR_MESSAGE = 'The Operations endpoint must define a JSON response schema.';

const COMPONENT_RESPONSES_REF_PREFIX = '#/components/responses/';
const COMPONENT_SCHEMAS_REF_PREFIX = '#/components/schemas/';

/**
 * Checks that Operations endpoints defined by IPA-132 return the OperationResponse schema: the
 * single Operation endpoint must reference it directly, and the Operations collection endpoint
 * must reference a paginated wrapper schema whose results items reference it.
 *
 * @param {string} input - The response status code of the GET method
 * @param {object} _ - Unused
 * @param {object} context - The context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const resourcePath = path[1];
  const responseCode = input;

  if (!responseCode.startsWith('2')) {
    return;
  }
  const isSingleOperation = isSingleOperationPath(resourcePath);
  if (!isSingleOperation && !isOperationsCollectionPath(resourcePath)) {
    return;
  }

  // Work on the unresolved document, where schema references are still visible by name
  const oas = documentInventory.unresolved;
  const responseOrRef = resolveObject(oas, path);
  const response = resolveResponseRef(responseOrRef, oas);
  if (!response) {
    return;
  }
  // Errors on a shared component response anchor at the referencing response, since the shared
  // component's content is not present at this document location
  const contentBasePath = responseOrRef === response ? path : undefined;

  const errors = checkViolationsAndReturnErrors(isSingleOperation, response, contentBasePath, oas, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, response, path);
};

function checkViolationsAndReturnErrors(isSingleOperation, response, contentBasePath, oas, path, ruleName) {
  try {
    const jsonContentEntries = Object.entries(response.content ?? {}).filter(([mediaType]) =>
      mediaType.endsWith('json')
    );
    // A 2xx response without a JSON media type cannot return the OperationResponse schema
    if (jsonContentEntries.length === 0) {
      return [{ path, message: MISSING_SCHEMA_ERROR_MESSAGE }];
    }

    const errors = [];
    for (const [mediaType, content] of jsonContentEntries) {
      const mediaTypePath = contentBasePath ? [...contentBasePath, 'content', mediaType] : path;
      if (!content.schema) {
        errors.push({ path: mediaTypePath, message: MISSING_SCHEMA_ERROR_MESSAGE });
        continue;
      }

      if (isSingleOperation) {
        if (!schemaReferencesOperationResponse(content.schema)) {
          errors.push({ path: mediaTypePath, message: SINGLE_OPERATION_ERROR_MESSAGE });
        }
        continue;
      }

      // The Operations collection response must reference a paginated wrapper schema that defines
      // the results array directly, the shape accepted by the IPA-110 pagination rules: inline
      // and allOf-composed wrappers are rejected, consistent with
      // xgen-IPA-110-collections-use-paginated-prefix and
      // xgen-IPA-110-collections-response-define-results-array
      const wrapperSchema = getReferencedSchema(content.schema, oas);
      const resultsItems = wrapperSchema?.properties?.results?.items;
      if (!(resultsItems && schemaReferencesOperationResponse(resultsItems))) {
        errors.push({ path: mediaTypePath, message: OPERATIONS_COLLECTION_ERROR_MESSAGE });
      }
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}

// The response itself may be defined as a reference to a shared component response
function resolveResponseRef(responseOrRef, oas) {
  if (responseOrRef?.$ref === undefined) {
    return responseOrRef;
  }
  if (!responseOrRef.$ref.startsWith(COMPONENT_RESPONSES_REF_PREFIX)) {
    return undefined;
  }
  return oas.components?.responses?.[getSchemaNameFromRef(responseOrRef.$ref)];
}

function schemaReferencesOperationResponse(schema) {
  return schema.$ref !== undefined && getSchemaNameFromRef(schema.$ref) === OPERATION_RESPONSE_SCHEMA_NAME;
}

function getReferencedSchema(schema, oas) {
  if (schema.$ref === undefined || !schema.$ref.startsWith(COMPONENT_SCHEMAS_REF_PREFIX)) {
    return undefined;
  }
  return oas.components?.schemas?.[getSchemaNameFromRef(schema.$ref)];
}
