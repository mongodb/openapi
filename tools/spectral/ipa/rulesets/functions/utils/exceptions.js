import { resolveObject } from './componentUtils.js';

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
 * Creates an error for an exception on an object that is already covered by an exception
 * on its containing schema. The object does not need its own exception, regardless of whether
 * it violates or adopts the rule.
 *
 * @param {Array<string>} objectPath the JSON path to the object with the unnecessary exception
 * @param {string} ruleName the name of the rule
 * @returns {Array<{path: Array<string>, message: string}>} an array with the unnecessary exception error
 */
export function getUnnecessaryInheritedExceptionError(objectPath, ruleName) {
  return [
    {
      path: [...objectPath, EXCEPTION_EXTENSION, ruleName],
      message:
        'This component is covered by an exception on its containing schema and does not need its own exception. Please remove the exception.',
    },
  ];
}

/**
 * Creates an error for a schema-level exception that is not needed by any field of the schema.
 *
 * @param {Array<string>} schemaPath the JSON path to the schema with the unnecessary exception
 * @param {string} ruleName the name of the rule
 * @returns {Array<{path: Array<string>, message: string}>} an array with the unnecessary exception error
 */
export function getUnnecessarySchemaExceptionError(schemaPath, ruleName) {
  return [
    {
      path: [...schemaPath, EXCEPTION_EXTENSION, ruleName],
      message:
        'This component does not need an exception because none of its fields violate the rule. Please remove the exception.',
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

/**
 * Finds an exception for a specified rule name in the schema containing the given property.
 * An exception on the schema applies to all of its properties.
 *
 * @param {Object} oas - The OpenAPI Specification object.
 * @param {Object} property - The property object being checked.
 * @param {Array<string>} propertyPath - The JSON path to the property, ending with ['properties', propertyName].
 * @param {string} ruleName - The name of the rule to check for exceptions.
 * @return {null|Object} An object with the schema containing the rule exception if found, an object with an error
 * if both the property and the schema have the exception, or null if the schema has no exception.
 */
export function findExceptionInParentSchema(oas, property, propertyPath, ruleName) {
  if (propertyPath.length < 2 || propertyPath[propertyPath.length - 2] !== 'properties') {
    return null;
  }

  const schema = resolveObject(oas, propertyPath.slice(0, -2));
  if (!schema || !hasException(schema, ruleName)) {
    return null;
  }

  if (property && hasException(property, ruleName)) {
    return { error: getUnnecessaryInheritedExceptionError(propertyPath, ruleName) };
  }
  return { schema: schema };
}
