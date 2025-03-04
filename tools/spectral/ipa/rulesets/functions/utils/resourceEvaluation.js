export const AUTH_PREFIX = '/api/atlas/v2';
export const UNAUTH_PREFIX = '/api/atlas/v2/unauth';

/**
 * Checks if a path represents a collection of resources/singleton resource.
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
  const pattern = new RegExp(`^.*/[a-zA-Z]+/{[a-zA-Z]+}$`);
  return pattern.test(path);
}

/**
 * Returns the resource collection identifier for a resource based on a single resource identifier.
 *
 * @param {string} singleResourceIdentifier a valid single resource identifier
 * @returns {string} the resource collection identifier
 */
export function getResourceCollectionIdentifier(singleResourceIdentifier) {
  const pathSections = singleResourceIdentifier.split('/');
  return pathSections.slice(0, pathSections.length - 1).join('/');
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
 * Checks if a resource is a singleton resource ({@link https://docs.devprod.prod.corp.mongodb.com/ipa/113 IPA-113}) based on the paths for the
 * resource. The resource may have custom methods. Use {@link getResourcePaths} to get all paths of a resource.
 *
 * @param resourcePaths all paths for the resource to be evaluated as an array of strings
 * @returns {boolean}
 */
export function isSingletonResource(resourcePaths) {
  if (!isResourceCollectionIdentifier(resourcePaths[0])) {
    return false;
  }

  if (resourcePaths.length === 1) {
    return resourceBelongsToSingleParent(resourcePaths[0]);
  }
  const additionalPaths = resourcePaths.slice(1);
  return additionalPaths.every(isCustomMethodIdentifier);
}

/**
 * Checks if a resource is a standard resource ({@link https://docs.devprod.prod.corp.mongodb.com/ipa/103 IPA-103}) based on the paths for the
 * resource. The resource may have custom methods. Use {@link getResourcePaths} to get all paths of a resource.
 *
 * @param resourcePaths all paths for the resource to be evaluated as an array of strings
 * @returns {boolean}
 */
export function isStandardResource(resourcePaths) {
  if (!isResourceCollectionIdentifier(resourcePaths[0]) || isSingletonResource(resourcePaths)) {
    return false;
  }
  if (resourcePaths.length === 1) {
    return true;
  }
  if (resourcePaths.length === 2) {
    return isSingleResourceIdentifier(resourcePaths[1]);
  }
  const additionalPaths = resourcePaths.slice(2);
  return isSingleResourceIdentifier(resourcePaths[1]) && additionalPaths.every(isCustomMethodIdentifier);
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
 * Get all paths for a resource based on the path for the resource collection
 * For example, resource collection path '/resource' may return ['/resource', '/resource{id}', '/resource{id}:customMethod']
 *
 * @param {string} resourceCollectionPath the path string
 * @param {Array<string>} allPaths all paths
 * @returns {string[]} all paths for a resource, including the path for the resource collection
 */
export function getResourcePaths(resourceCollectionPath, allPaths) {
  const singleResourcePathPattern = new RegExp(`^${resourceCollectionPath}/{[a-zA-Z]+}$`);
  const singleResourceCustomMethodPattern = new RegExp(`^${resourceCollectionPath}/{[a-zA-Z]+}:+[a-zA-Z]+$`);
  const customMethodPattern = new RegExp(`^${resourceCollectionPath}:+[a-zA-Z]+$`);
  return allPaths.filter(
    (p) =>
      resourceCollectionPath === p ||
      singleResourcePathPattern.test(p) ||
      customMethodPattern.test(p) ||
      singleResourceCustomMethodPattern.test(p)
  );
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
