import { isCustomMethodIdentifier, isPathParam, removePrefix } from './resourceEvaluation.js';
import { legacyLroOperationIds } from './legacyLroOperationIds.js';

export const OPERATIONS_SEGMENT = 'operations';

/**
 * The operations returning HTTP 202 that predate IPA-132 and do not follow the long-running
 * operation contract. The merge step marks them `legacy: true` in the federated spec; this list
 * excludes them on specs the merge step has not processed, such as the per-service source specs.
 */
export const LEGACY_LRO_OPERATION_IDS = new Set(legacyLroOperationIds);

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

export const LRO_EXTENSION = 'x-xgen-long-running-operation';

/**
 * Checks if an operation is a long-running operation that must follow the IPA-132 contract. A
 * long-running operation declares a 202 response: the x-xgen-long-running-operation extension is
 * derived from the 202 during the merge step, so selecting on the declared 202 gives the same
 * result on the federated spec while also working on specs the merge step has not processed,
 * such as the per-service source specs. Legacy operations predate IPA-132 and are excluded,
 * whether marked `legacy: true` by the merge step or matched by the legacy operationId list.
 *
 * @param {object} operation the operation object to evaluate
 * @returns {boolean} true if the operation is a long-running operation that is not legacy
 */
export function isCompliantLongRunningOperation(operation) {
  if (!operation.responses?.['202']) {
    return false;
  }
  if (operation[LRO_EXTENSION]?.legacy === true) {
    return false;
  }
  return !LEGACY_LRO_OPERATION_IDS.has(operation.operationId);
}

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
 * Checks if a schema is composed through allOf, oneOf or anyOf. The OperationResponse schema
 * defined by IPA-132 is a single flat schema, so composition is not allowed and the schema rules
 * reject or skip composed schemas.
 *
 * @param {object} schema the schema to evaluate
 * @returns {boolean} true if the schema uses allOf, oneOf or anyOf composition
 */
export function usesComposition(schema) {
  return schema.allOf !== undefined || schema.oneOf !== undefined || schema.anyOf !== undefined;
}
