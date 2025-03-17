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
 * Checks if every HTTP method in the path item has an exception for the specified rule
 * Only considers methods that actually exist in the path item
 *
 * @param {object} pathItem - The path item object containing HTTP methods
 * @param {string} ruleName - The name of the rule to check for exceptions
 * @returns {boolean} true if every HTTP method has an exception for the rule, otherwise false
 */
export function hasExceptionInEveryHttpMethod(pathItem, ruleName) {
  if (!pathItem) return false;
  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
  const existingMethods = httpMethods.filter((method) => pathItem[method]);

  // If no HTTP methods exist, return false
  if (existingMethods.length === 0) return false;

  // Check if every existing HTTP method has the exception
  return existingMethods.every((method) => hasException(pathItem[method], ruleName));
}
