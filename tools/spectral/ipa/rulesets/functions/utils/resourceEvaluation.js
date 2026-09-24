import { hasException } from './exceptions.js';

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
 * '/resource/{resourceId}/child/{childId}' returns true
 * '/resource/{id}/child' returns false
 * '/resource' returns false
 * '/resource/child/{id}' returns false
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

/**
 * Checks whether a resource is root-level, i.e. mounted directly under the API prefix with no
 * parent resource. Both the resource collection path and the single resource path are recognized.
 * For example:
 * '/resource' returns true
 * '/resource/{id}' returns true
 * '/parent/{id}/resource' returns false
 * '/parent/resource/{id}' returns false
 *
 * @param {string} resourcePath a path for a resource
 * @returns {boolean}
 */
export function isRootLevelResource(resourcePath) {
  const path = removePrefix(resourcePath);
  const sections = path.split('/').filter((section) => section.length > 0);
  if (sections.length > 0 && isPathParam(sections[sections.length - 1])) {
    sections.pop();
  }
  return sections.length === 1;
}

export function isCustomMethodIdentifier(path) {
  return path.includes(':');
}

export function getCustomMethodName(path) {
  return path.split(':')[1];
}

export function stripCustomMethodName(path) {
  return path.substring(0, path.indexOf(':'));
}

/**
 * Checks if a path represents a :reset custom method.
 * For example: '/resource/{id}/singleton:reset' returns true
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if the path is a :reset custom method, false otherwise
 */
export function isResetMethod(path) {
  return isCustomMethodIdentifier(path) && getCustomMethodName(path) === 'reset';
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

  const collectionPath = collectionIdentifier[0];

  if (!resourceBelongsToSingleParent(collectionPath) || hasPostMethod(resourcePathItems[collectionPath])) {
    return false;
  }

  if (resourcePaths.length === 1) {
    return true;
  }

  // If there are multiple paths, all additional paths must be custom methods
  const additionalPaths = resourcePaths.filter((p) => p !== collectionPath);
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
 * Checks if a path object has a DELETE method
 *
 * @param pathObject the path object to evaluate
 * @returns {boolean}
 */
export function hasDeleteMethod(pathObject) {
  return Object.keys(pathObject).includes('delete');
}

/**
 * Checks if a path object has a PUT method
 *
 * @param pathObject the path object to evaluate
 * @returns {boolean}
 */
export function hasPutMethod(pathObject) {
  return Object.keys(pathObject).includes('put');
}

/**
 * Checks if a path object has a PATCH method
 *
 * @param pathObject the path object to evaluate
 * @returns {boolean}
 */
export function hasPatchMethod(pathObject) {
  return Object.keys(pathObject).includes('patch');
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
 * Instance paths are normalized to their collection path first, so
 * '/parent/{parentId}/child/{childId}' returns true.
 *
 * @param {string} resourcePath a path for a resource
 * @returns {boolean}
 */
export function resourceBelongsToSingleParent(resourcePath) {
  // Ignore /api/atlas/v2 and /api/atlas/v2/unauth
  const path = removePrefix(resourcePath);
  if (path === '') {
    return true;
  }

  const sections = path.split('/').filter((section) => section.length > 0);
  // Normalize an instance path down to its collection path, so that
  // '/parent/{parentId}/child/{childId}' is evaluated as '/parent/{parentId}/child'
  if (sections.length > 0 && isPathParam(sections[sections.length - 1])) {
    sections.pop();
  }
  // The resource name is last, so the section before it holds the parent's id if there is a parent
  return sections.length > 1 && isPathParam(sections[sections.length - 2]);
}

// TODO move prefixes to be rule arguments
export function removePrefix(path) {
  if (path.startsWith(UNAUTH_PREFIX)) {
    return path.slice(UNAUTH_PREFIX.length);
  }
  if (path.startsWith(AUTH_PREFIX)) {
    return path.slice(AUTH_PREFIX.length);
  }
  return path;
}

/**
 * Checks if all properties in a schema are read-only.
 *
 * @param {Object} schema - The schema to check
 * @param {Set<Object>} visiting - Schemas in the current traversal path
 * @returns {boolean} true if all properties are readOnly, false otherwise
 */
export function allPropertiesAreReadOnly(schema, visiting = new Set()) {
  if (!schema || typeof schema !== 'object') {
    return false;
  }

  if (visiting.has(schema)) {
    return false;
  }
  visiting.add(schema);

  try {
    // Compositions can coexist with properties or items; none may hide writable fields in the others.
    let hasReadOnlyComposition = false;
    for (const composition of ['allOf', 'anyOf', 'oneOf']) {
      const branches = schema[composition];
      if (!Array.isArray(branches)) {
        continue;
      }
      if (branches.length === 0 || !branches.every((subSchema) => isSchemaReadOnly(subSchema, visiting))) {
        return false;
      }
      hasReadOnlyComposition = true;
    }

    if (schema.properties) {
      const properties = Object.values(schema.properties);
      return properties.length > 0 && properties.every((property) => isSchemaReadOnly(property, visiting));
    }

    if (schema.items) {
      return isSchemaReadOnly(schema.items, visiting);
    }

    return hasReadOnlyComposition;
  } finally {
    visiting.delete(schema);
  }
}

function isSchemaReadOnly(schema, visiting) {
  return schema?.readOnly === true || allPropertiesAreReadOnly(schema, visiting);
}

/**
 * Checks if a resource is a read-only resource.
 * A read-only resource has all properties in its GET response schema marked as readOnly: true
 * or composed only of read-only properties.
 *
 * @param {Object} resourcePathItems - All path items for the resource to be evaluated
 * @returns {boolean} true if the resource is read-only, false otherwise
 */
export function isReadOnlyResource(resourcePathItems) {
  const resourcePaths = Object.keys(resourcePathItems);

  // Check if any path has an exception for xgen-IPA-104-resource-has-GET
  // If so, we cannot determine if the resource is read-only
  for (const path of resourcePaths) {
    if (hasException(resourcePathItems[path], 'xgen-IPA-104-resource-has-GET')) {
      return false;
    }
  }

  // First, look for a standard Get method
  let getPathItem = null;
  for (const path of resourcePaths) {
    if (isSingleResourceIdentifier(path) && hasGetMethod(resourcePathItems[path])) {
      getPathItem = resourcePathItems[path];
      break;
    }
  }

  // If not found, look for Singleton Get method
  if (!getPathItem) {
    for (const path of resourcePaths) {
      if (hasGetMethod(resourcePathItems[path])) {
        getPathItem = resourcePathItems[path];
        break;
      }
    }
  }

  if (!getPathItem || !getPathItem.get) {
    return false;
  }

  const getMethod = getPathItem.get;
  if (!getMethod.responses) {
    return false;
  }

  const successfulResponseKey = Object.keys(getMethod.responses).find((k) => k.startsWith('2'));
  if (!successfulResponseKey) {
    return false;
  }

  const response = getMethod.responses[successfulResponseKey];
  if (!response || !response.content) {
    return false;
  }

  const contentTypes = Object.keys(response.content);
  if (contentTypes.length === 0) {
    return false;
  }

  for (const mediaType of contentTypes) {
    const mediaTypeObj = response.content[mediaType];
    if (!mediaTypeObj || !mediaTypeObj.schema) {
      continue;
    }

    if (!allPropertiesAreReadOnly(mediaTypeObj.schema)) {
      return false;
    }
  }

  return true;
}
