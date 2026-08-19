import { isCustomMethodIdentifier, isPathParam, removePrefix } from './resourceEvaluation.js';

export const OPERATIONS_SEGMENT = 'operations';

/**
 * Splits a path into its resource identifier segments, ignoring the standard path prefix, so that
 * the segments describe the resource hierarchy only.
 *
 * Custom method paths (`:customMethod`) yield no segments, keeping them out of scope for the
 * IPA-132 Operations rules: flagging their methods here would contradict the IPA-109 requirement
 * that custom methods use POST or GET.
 *
 * @param {string} path the path to split
 * @returns {string[]} the resource identifier segments
 */
function toResourceSegments(path) {
  if (isCustomMethodIdentifier(path)) {
    return [];
  }
  return removePrefix(path)
    .split('/')
    .filter((segment) => segment.length > 0);
}

/**
 * Checks if a path identifies an Operations resource collection defined by IPA-132, i.e. the path
 * ends with an `operations` segment. For example:
 * '/api/atlas/v2/resourceName/operations' returns true
 * '/api/atlas/v2/resourceName/{pathParam}/operations' returns true
 * '/api/atlas/v2/operations' returns true
 * '/api/atlas/v2/resourceName/operations/{operationId}' returns false
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if the path identifies an Operations resource collection
 */
export function isOperationsCollectionPath(path) {
  const segments = toResourceSegments(path);
  return segments.length > 0 && segments[segments.length - 1] === OPERATIONS_SEGMENT;
}

/**
 * Checks if a path identifies a single Operations resource defined by IPA-132, i.e. the path ends
 * with an `operations` segment followed by a single path parameter. For example:
 * '/api/atlas/v2/resourceName/operations/{operationId}' returns true
 * '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}' returns true
 * '/api/atlas/v2/resourceName/operations' returns false
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if the path identifies a single Operations resource
 */
export function isSingleOperationPath(path) {
  const segments = toResourceSegments(path);
  return (
    segments.length > 1 &&
    segments[segments.length - 2] === OPERATIONS_SEGMENT &&
    isPathParam(segments[segments.length - 1])
  );
}

/**
 * Checks if a path identifies an Operations resource defined by IPA-132, either the Operations
 * resource collection or a single Operations resource.
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if the path identifies an Operations resource
 */
export function isOperationsPath(path) {
  return isOperationsCollectionPath(path) || isSingleOperationPath(path);
}

/**
 * Checks if any resource identifier segment of a path is an `operations` segment, regardless of
 * its position in the path.
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if the path contains an `operations` segment
 */
export function containsOperationsSegment(path) {
  return toResourceSegments(path).includes(OPERATIONS_SEGMENT);
}

/**
 * Checks that nothing is nested below the first `operations` segment of a path: the segment may
 * only be followed by a single operation identifier path parameter. Paths without an `operations`
 * segment are considered leaves. For example:
 * '/api/atlas/v2/resourceName/operations' returns true
 * '/api/atlas/v2/resourceName/operations/{operationId}' returns true
 * '/api/atlas/v2/resourceName/operations/subresource' returns false
 * '/api/atlas/v2/resourceName/operations/{operationId}/operations' returns false
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if nothing is nested below the first `operations` segment
 */
export function operationsSegmentIsLeaf(path) {
  const segments = toResourceSegments(path);
  const firstIndex = segments.indexOf(OPERATIONS_SEGMENT);
  if (firstIndex === -1) {
    return true;
  }
  const trailingSegments = segments.slice(firstIndex + 1);
  return trailingSegments.length === 0 || (trailingSegments.length === 1 && isPathParam(trailingSegments[0]));
}

export const OPERATION_RESPONSE_SCHEMA_NAME = 'OperationResponse';

/**
 * Checks if the enum values defined in a schema match an expected set of values exactly, in any
 * order.
 *
 * @param {string[]|undefined} enumValues the enum values defined in the schema
 * @param {string[]} expectedValues the expected enum values
 * @returns {boolean} true if the enum values match the expected values exactly
 */
export function isExactEnumMatch(enumValues, expectedValues) {
  return (
    Array.isArray(enumValues) &&
    enumValues.length === expectedValues.length &&
    expectedValues.every((value) => enumValues.includes(value))
  );
}

/**
 * Collects the properties of a schema, merging the properties of its allOf sub-schemas, which
 * Spectral does not flatten during resolution. allOf is conjunctive, so a property re-declared
 * by several sub-schemas combines the keywords of every declaration instead of overwriting them:
 * enums apply intersected, and nested property maps are merged recursively. Composition through
 * oneOf/anyOf is not merged, and circular references, which Spectral leaves as unresolved $ref
 * stubs, contribute nothing.
 *
 * @param {object} schema the schema to collect properties for
 * @returns {object} the properties of the schema and all of its allOf sub-schemas
 */
export function getMergedProperties(schema) {
  const properties = Object.create(null);
  mergePropertyMaps(properties, schema.properties);
  for (const subSchema of schema.allOf ?? []) {
    mergePropertyMaps(properties, getMergedProperties(subSchema));
  }
  return properties;
}

function mergePropertyMaps(target, source) {
  for (const [name, definition] of Object.entries(source ?? {})) {
    const existing = target[name];
    if (!existing) {
      target[name] = definition;
      continue;
    }
    const merged = { ...existing, ...definition };
    if (Array.isArray(existing.enum) && Array.isArray(definition.enum)) {
      merged.enum = definition.enum.filter((value) => existing.enum.includes(value));
    } else if (existing.enum !== undefined || definition.enum !== undefined) {
      merged.enum = definition.enum ?? existing.enum;
    }
    if (existing.properties !== undefined && definition.properties !== undefined) {
      const mergedNested = Object.create(null);
      mergePropertyMaps(mergedNested, existing.properties);
      mergePropertyMaps(mergedNested, definition.properties);
      merged.properties = mergedNested;
    }
    target[name] = merged;
  }
}

/**
 * Finds the JSONPath segments locating a property within a schema, descending into allOf
 * sub-schemas, so that violations anchor at the property's actual document location instead of a
 * location that only exists after merging.
 *
 * @param {object} schema the schema defining the property
 * @param {string} property the property name to locate
 * @returns {(string|number)[]|undefined} the path segments relative to the schema, or undefined
 */
export function getPropertyPath(schema, property) {
  if (schema.properties?.[property]) {
    return ['properties', property];
  }
  const subSchemas = schema.allOf ?? [];
  for (let i = 0; i < subSchemas.length; i++) {
    const subPath = getPropertyPath(subSchemas[i], property);
    if (subPath) {
      return ['allOf', i, ...subPath];
    }
  }
  return undefined;
}

/**
 * Collects the required property names of a schema, merging the required lists of its allOf
 * sub-schemas, which Spectral does not flatten during resolution.
 *
 * @param {object} schema the schema to collect required property names for
 * @returns {string[]} the required property names of the schema and all of its allOf sub-schemas
 */
export function getMergedRequired(schema) {
  const required = Array.isArray(schema.required) ? [...schema.required] : [];
  for (const subSchema of schema.allOf ?? []) {
    required.push(...getMergedRequired(subSchema));
  }
  return required;
}
