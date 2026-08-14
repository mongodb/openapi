import { isCustomMethodIdentifier, isPathParam, removePrefix } from './resourceEvaluation.js';

export const OPERATIONS_SEGMENT = 'operations';

/**
 * Splits a path into its resource identifier segments, ignoring the standard path prefix, so that
 * the segments describe the resource hierarchy only.
 *
 * Custom method paths (`:customMethod`) yield no segments, keeping them out of scope for the
 * IPA-132 Operations rules: custom methods on Operations endpoints will be rejected by a dedicated
 * rule, and flagging them here would contradict the IPA-109 requirement that custom methods use
 * POST or GET.
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
