export const EXCEPTION_EXTENSION = 'x-xgen-IPA-exception';

/**
 * Checks if the object has an exception extension "x-xgen-IPA-exception"
 *
 * @param object the object to evaluate
 * @param ruleName the name of the exempted rule
 * @returns {boolean} true if the object has an exception named ruleName, otherwise false
 */
export function hasException(object, ruleName) {
  if (object[EXCEPTION_EXTENSION]) {
    return Object.keys(object[EXCEPTION_EXTENSION]).includes(ruleName);
  }
  return false;
}

/**
 * Finds an exception in the path hierarchy of an OpenAPI Specification (OAS) document
 * for a specific rule name, starting from the current path and traversing up to parent paths.
 *
 * @param {object} oas - OpenAPI Specification document containing the paths.
 * @param {string} currentPath - Current path to check for exceptions.
 * @param {string} ruleName - Name of the rule for which the exception is being checked.
 * @return {string|null} Returns the path where the exception is found,
 * or null if no exception is found in the current path or its hierarchy.
 */
export function findExceptionInPathHierarchy(oas, currentPath, ruleName) {
  // Check current path first
  if (hasException(oas.paths[currentPath], ruleName)) {
    return currentPath;
  }

  // Check parent paths by removing segments from the end
  const pathSegments = currentPath.split('/').filter(segment => segment !== '');

  for (let i = pathSegments.length - 1; i > 0; i--) {
    const parentPath = '/' + pathSegments.slice(0, i).join('/');
    if (oas.paths[parentPath] && hasException(oas.paths[parentPath], ruleName)) {
      return parentPath;
    }
  }

  return null;
}