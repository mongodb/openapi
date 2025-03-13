export const AUTH_PREFIX = '/api/atlas/v2';
export const UNAUTH_PREFIX = '/api/atlas/v2/unauth';

/**
 * Checks if a path represents a collection of resources/a singleton resource. For example:
 * '/resource' returns true
 * '/resource/{id}/child' returns true
 * '/resource/child' returns false
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if the path represents a collection of resources/singleton resource, false otherwise
 */
export function isResourceCollectionIdentifier(path) {
  const p = removePrefix(path);
  const childPattern = new RegExp(`^.*}/[a-zA-Z]+$`);
  const basePattern = new RegExp(`^/[a-zA-Z]+$`);
  return basePattern.test(p) || childPattern.test(p);
}

/**
 * Checks if a path represents a single resource. For example:
 * '/resource/{id}' returns true
 * '/resource/{id}/child' returns false
 * '/resource/{id}/{id}' returns false
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if the path represents a single resource, false otherwise
 */
export function isSingleResourceIdentifier(path) {
  const p = removePrefix(path);

  // Check if the path ends with /{paramName} pattern
  const endsWithParamPattern = /\/\{[a-zA-Z][a-zA-Z0-9]*}$/;

  if (!endsWithParamPattern.test(p)) {
    return false;
  }

  // Extract the part before the final parameter
  const lastSlashBeforeParam = p.lastIndexOf('/');
  if (lastSlashBeforeParam === -1) {
    return false;
  }

  // Check if the preceding part is a valid resource collection identifier
  const collectionPath = p.substring(0, lastSlashBeforeParam);
  return isResourceCollectionIdentifier(collectionPath);
}

export function isCustomMethodIdentifier(path) {
  return path.includes(':');
}

export function getCustomMethodName(path) {
  return path.split(':')[1];
}

export function isPathParam(string) {
  return string.startsWith('{') && string.endsWith('}');
}

/**
 * Checks if a resource is a singleton resource ({@link https://docs.devprod.prod.corp.mongodb.com/ipa/113 IPA-113}) based on the path items for the
 * resource. The resource may have custom methods. Use {@link getResourcePathItems} to get all path items of a resource.
 *
 * @param resourcePathItems all path items for the resource to be evaluated as an array of strings
 * @returns {boolean}
 */
export function isSingletonResource(resourcePathItems) {
  const resourcePaths = Object.keys(resourcePathItems);
  const collectionIdentifier = resourcePaths.filter((p) => isResourceCollectionIdentifier(p));
  if (collectionIdentifier.length !== 1) {
    return false;
  }

  if (resourcePaths.length === 1) {
    return resourceBelongsToSingleParent(resourcePaths[0]) && !hasPostMethod(resourcePathItems[resourcePaths[0]]);
  }
  const additionalPaths = resourcePaths.splice(resourcePaths.indexOf(collectionIdentifier[0]), 1);
  return additionalPaths.every(isCustomMethodIdentifier);
}

/**
 * Checks if a path object has a GET method
 *
 * @param pathObject the path object to evaluate
 * @returns {boolean}
 */
export function hasGetMethod(pathObject) {
  return Object.keys(pathObject).includes('get');
}

/**
 * Checks if a path object has a POST method
 *
 * @param pathObject the path object to evaluate
 * @returns {boolean}
 */
export function hasPostMethod(pathObject) {
  return Object.keys(pathObject).includes('post');
}

/**
 * Get all path items for a resource based on the path for the resource collection
 * For example, resource collection path '/resource' may return path items for ['/resource', '/resource{id}', '/resource{id}:customMethod']
 *
 * @param {string} resourceCollectionPath the path for the resource collection
 * @param {Object} allPathItems all path items
 * @returns {Object} all path items for a resource, including the path for the resource collection
 */
export function getResourcePathItems(resourceCollectionPath, allPathItems) {
  const singleResourcePathPattern = new RegExp(`^${resourceCollectionPath}/{[a-zA-Z]+}$`);
  const singleResourceCustomMethodPattern = new RegExp(`^${resourceCollectionPath}/{[a-zA-Z]+}:+[a-zA-Z]+$`);
  const customMethodPattern = new RegExp(`^${resourceCollectionPath}:+[a-zA-Z]+$`);
  return Object.keys(allPathItems)
    .filter(
      (p) =>
        resourceCollectionPath === p ||
        singleResourcePathPattern.test(p) ||
        customMethodPattern.test(p) ||
        singleResourceCustomMethodPattern.test(p)
    )
    .reduce((obj, key) => {
      obj[key] = allPathItems[key];
      return obj;
    }, {});
}

/**
 * Checks whether a resource belongs to one parent resource.
 * For example, '/resource' returns false, '/resource/{id}/child' returns true.
 *
 * @param {string} resourcePath a path for a resource
 * @returns {boolean}
 */
function resourceBelongsToSingleParent(resourcePath) {
  // Ignore /api/atlas/v2 and /api/atlas/v2/unauth
  const path = removePrefix(resourcePath);
  if (path === '') {
    return true;
  }

  let resourcePathSections = path.split('/');
  if (resourcePathSections[0] === '') {
    resourcePathSections.shift();
  }
  if (resourcePathSections.length < 2) {
    return false;
  }
  if (isPathParam(resourcePathSections[resourcePathSections.length - 1])) {
    resourcePathSections = resourcePathSections.slice(0, resourcePathSections.length - 2);
  }
  if (resourcePathSections.length === 1) {
    return false;
  }
  const parentResourceSection = resourcePathSections[resourcePathSections.length - 2];
  return isPathParam(parentResourceSection);
}

function removePrefix(path) {
  if (path.startsWith(AUTH_PREFIX)) {
    return path.slice(AUTH_PREFIX.length);
  }
  if (path.startsWith(UNAUTH_PREFIX)) {
    return path.slice(UNAUTH_PREFIX.length);
  }
  return path;
}

/**
 * Retrieves the response schema of the GET method for a resource by media type
 *
 * This function:
 * 1. Finds all path items related to the resource collection
 * 2. Identifies the single resource path (e.g., '/resource/{id}')
 * 3. Checks if the single resource has a GET method
 * 4. Returns the response schema for the specified media type if available
 *
 * @param {string} mediaType - The media type to retrieve the schema for (e.g., 'application/vnd.atlas.2023-01-01+json')
 * @param {string} pathForResourceCollection - The path for the collection of resources (e.g., '/resource')
 * @param {Object} oas - The resolved OpenAPI document
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
  if (!hasGetMethod(singleResourcePathObject)) {
    return null;
  }

  const getMethodObject = singleResourcePathObject.get;
  if (!getMethodObject.responses) {
    return null;
  }

  const response = getMethodObject.responses['200'];
  if (!response) {
    return null;
  }

  const schema = response.content[mediaType];
  if (!schema) {
    return null;
  }
  return schema;
}
