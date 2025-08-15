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

export function getUnnecessaryExceptionError(objectPath, ruleName) {
  return [
    {
      path: [...objectPath, EXCEPTION_EXTENSION, ruleName],
      message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
    },
  ];
}

/**
 * Finds an exception for a specified rule name in the current path or its parent paths within the given OpenAPI Specification (OAS) object.
 *
 * @param {Object} oas - The OpenAPI Specification object containing path definitions.
 * @param {string} currentPath - The path to start searching for exceptions.
 * @param {string} ruleName - The name of the rule to check for exceptions.
 * @param {string} jsonPath - The JSON path to the current operation or entity being checked.
 * @return {string|null|Object} The parent path with the rule exception if found, or null if no exceptions exist.
 */
export function findExceptionInPathHierarchy(oas, currentPath, ruleName, jsonPath) {
  let currentPathHasException = false;
  if (hasException(oas.paths[currentPath], ruleName)) {
    currentPathHasException = true;
  }

  // Check parent paths by removing segments from the end
  const pathSegments = currentPath.split('/').filter((segment) => segment !== '');

  for (let i = pathSegments.length - 1; i > 0; i--) {
    const parentPath = '/' + pathSegments.slice(0, i).join('/');
    if (oas.paths[parentPath] && hasException(oas.paths[parentPath], ruleName)) {
      if (currentPathHasException) {
        return { error: getUnnecessaryExceptionError(jsonPath, ruleName) };
      }
      return { parentPath: parentPath };
    }
  }

  return null;
}
