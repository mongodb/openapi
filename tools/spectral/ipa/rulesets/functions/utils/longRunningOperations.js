import { isPathParam } from './componentUtils.js';
import { isCustomMethodIdentifier, removePrefix, stripCustomMethodName } from './resourceEvaluation.js';

export const OPERATIONS_SEGMENT = 'operations';

/**
 * Splits a path into its resource identifier segments, ignoring the standard path prefix and any
 * custom method suffix (`:customMethod`), so that the segments describe the resource hierarchy only.
 *
 * @param {string} path the path to split
 * @returns {string[]} the resource identifier segments
 */
function toResourceSegments(path) {
  const pathWithoutCustomMethod = isCustomMethodIdentifier(path) ? stripCustomMethodName(path) : path;
  return removePrefix(pathWithoutCustomMethod)
    .split('/')
    .filter((segment) => segment.length > 0);
}

/**
 * Checks if a path identifies an Operations resource collection defined by IPA-132, i.e. the path
 * ends with an `operations` segment. Any custom method suffix is ignored. For example:
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
 * with an `operations` segment followed by a single path parameter. Any custom method suffix is
 * ignored. For example:
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
 * Checks if a path identifies an Operations resource mounted at the API root, i.e. an `operations`
 * segment with no parent resource, such as '/api/atlas/v2/operations' or
 * '/api/atlas/v2/operations/{operationId}'. IPA-132 requires Operations resources to be nested
 * under the parent resource that spawned the operation.
 *
 * @param {string} path the path to evaluate
 * @returns {boolean} true if the path identifies a root-level Operations resource
 */
export function isRootLevelOperationsPath(path) {
  return isOperationsPath(path) && toResourceSegments(path)[0] === OPERATIONS_SEGMENT;
}
