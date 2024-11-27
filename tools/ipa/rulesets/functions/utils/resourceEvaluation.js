export function isChild(path) {
  return path.endsWith('}');
}

export function isCustomMethod(path) {
  return path.includes(':');
}

/**
 * Checks if a resource is a singleton resource based on the paths for the
 * resource. The resource may have custom methods.
 *
 * @param resourcePaths all paths for the resource as an array of strings
 * @returns {boolean}
 */
export function isSingletonResource(resourcePaths) {
  if (resourcePaths.length === 1) {
    return true;
  }
  const additionalPaths = resourcePaths.slice(1);
  return !additionalPaths.some((p) => !isCustomMethod(p));
}

/**
 * Checks if a resource is a standard resource based on the paths for the
 * resource. The resource may have custom methods.
 *
 * @param resourcePaths all paths for the resource as an array of strings
 * @returns {boolean}
 */
export function isStandardResource(resourcePaths) {
  if (resourcePaths.length === 2 && isChild(resourcePaths[1])) {
    return true;
  }
  if (resourcePaths.length < 3 || !isChild(resourcePaths[1])) {
    return false;
  }
  const additionalPaths = resourcePaths.slice(2);
  return !additionalPaths.some((p) => !isCustomMethod(p));
}

/**
 * Checks if a path object has a GET method
 *
 * @param pathObject the path object to evaluate
 * @returns {boolean}
 */
export function hasGetMethod(pathObject) {
  return Object.keys(pathObject).some((o) => o === 'get');
}

/**
 * Get all paths for a resource based on the parent path
 *
 * @param parent the parent path string
 * @param allPaths all paths as an array of strings
 * @returns {*} a string array of all paths for a resource, including the parent
 */
export function getResourcePaths(parent, allPaths) {
  const childPathPattern = new RegExp(`^${parent}/{[a-zA-Z]+}$`);
  const customMethodPattern = new RegExp(`^${parent}/{[a-zA-Z]+}:+[a-zA-Z]+$`);
  return allPaths.filter((p) => parent === p || childPathPattern.test(p) || customMethodPattern.test(p));
}
