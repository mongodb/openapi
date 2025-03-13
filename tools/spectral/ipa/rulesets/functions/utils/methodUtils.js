import { getResourcePathItems, hasGetMethod, isSingleResourceIdentifier } from './resourceEvaluation.js';
import { schemaIsArray } from './schemaUtils.js';

/**
 * Returns a list of all successful response schemas for the passed operation, i.e. for any 2xx response.
 *
 * @param {object} operationObject the object for the operation
 * @returns {Object[{schemaPath: Array<string>, schema: Object}]} all 2xx response schemas and the path to each schema
 */
export function getAllSuccessfulResponseSchemas(operationObject) {
  const path = [];

  const responses = operationObject['responses'];
  path.push('responses');

  const successfulResponseKey = Object.keys(responses).filter((k) => k.startsWith('2'))[0];
  path.push(successfulResponseKey);

  const responseContent = responses[successfulResponseKey]['content'];
  path.push('content');

  const result = [];
  Object.keys(responseContent).forEach((k) => {
    const schema = responseContent[k]['schema'];
    const schemaPath = path.concat([k]);
    if (schema) {
      result.push({
        schemaPath,
        schema,
      });
    }
  });
  return result;
}

/**
 * Gets the schema reference for a schema object. If the schema does not have a reference, undefined is returned.
 *
 * @param {object} schema the unresolved schema object
 * @returns {string} the schema ref
 */
export function getSchemaRef(schema) {
  if (schemaIsArray(schema) && schema.items) {
    return schema.items.$ref;
  }
  return schema.$ref;
}

/**
 * Gets the schema name from a schema reference, for example '#/components/schemas/ResourceSchema'
 * returns 'ResourceSchema'.
 *
 * @param {string} schemaRef the schema reference
 * @returns {string} the schema name
 */
export function getSchemaNameFromRef(schemaRef) {
  const sections = schemaRef.split('/');
  return sections[sections.length - 1];
}

/**
 * Retrieves the response schema of the Get method for a resource by media type.
 * If the OAS is unresolved, the returning schema may contain a reference to a schema definition.
 * If there is no response with the exact media type version, the latest version before the passed one is returned, otherwise null
 *
 * This function:
 * 1. Finds all path items related to the resource collection
 * 2. Identifies the single resource path (e.g., '/resource/{id}')
 * 3. Checks if the single resource has a GET method
 * 4. Returns the response schema for the specified media type if available, or the latest version
 *
 * @param {string} mediaType - The media type to retrieve the schema for (e.g., 'application/vnd.atlas.2023-01-01+json')
 * @param {string} pathForResourceCollection - The path for the collection of resources (e.g., '/resource')
 * @param {Object} oas - The resolved or unresolved OpenAPI document
 * @returns {Object|null} - The response schema for the specified media type, or null if not found
 */
export function getResponseOfGetMethodByMediaType(mediaType, pathForResourceCollection, oas) {
  const resourcePathItems = getResourcePathItems(pathForResourceCollection, oas.paths);
  const resourcePaths = Object.keys(resourcePathItems);
  if (resourcePaths.length === 1) {
    return null;
  }

  const singleResourcePath = resourcePaths.find((path) => isSingleResourceIdentifier(path));
  if (!singleResourcePath) {
    return null;
  }

  const singleResourcePathObject = resourcePathItems[singleResourcePath];

  return getGETMethodResponseSchemaFromPathItem(singleResourcePathObject, mediaType);
}

/**
 * Retrieves the 200 response schema of the List method for a resource by media type.
 * If the OAS is unresolved, the returning schema may contain a reference to a schema definition.
 * If there is no response with the exact media type version, the latest version before the passed one is returned, otherwise null.
 *
 * @param {string} mediaType - The media type to retrieve the schema for (e.g., 'application/vnd.atlas.2023-01-01+json')
 * @param {string} pathForResourceCollection - The path for the collection of resources (e.g., '/resource')
 * @param {Object} oas - The resolved or unresolved OpenAPI document
 * @returns {Object|null} - The response schema for the specified media type, or null if not found
 */
export function getResponseOfListMethodByMediaType(mediaType, pathForResourceCollection, oas) {
  const pathObject = oas.paths[pathForResourceCollection];
  if (!pathObject) {
    return null;
  }

  return getGETMethodResponseSchemaFromPathItem(pathObject, mediaType);
}

/**
 * Returns the schema for the 200 response of the GET method for a path item by media type.
 * If there is no response with the exact media type version, the latest version before the passed one is returned, otherwise null.
 *
 * @param {Object} pathItem The path item to extract the GET response from
 * @param {string} mediaType The media type
 * @returns {Object|null} The schema object, or null if not found
 */
function getGETMethodResponseSchemaFromPathItem(pathItem, mediaType) {
  if (!hasGetMethod(pathItem)) {
    return null;
  }

  const getMethodObject = pathItem.get;
  if (!getMethodObject.responses) {
    return null;
  }

  const response = getMethodObject.responses['200'];
  if (!response || !response.content) {
    return null;
  }

  const versions = Object.keys(response.content);
  if (versions.includes(mediaType)) {
    const schema = response.content[mediaType];
    if (!schema) {
      return null;
    }
    return schema;
  }

  const orderedVersions = versions.sort().reverse();
  const latestVersionMatch = orderedVersions.find((version) => version < mediaType);
  if (latestVersionMatch) {
    const schema = response.content[latestVersionMatch];
    if (!schema) {
      return null;
    }
    return schema;
  }
  return null;
}
