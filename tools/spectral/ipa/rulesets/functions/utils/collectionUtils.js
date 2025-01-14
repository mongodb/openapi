import collector, { EntryType } from '../../../metrics/collector.js';

/**
 * Collects a violation entry and returns formatted error data.
 *
 * @param {string} path - The JSON path for the object where the rule violation occurred.
 * @param {string} ruleName - The name of the rule that was violated.
 * @param {string|Array<Object>} errorData - The error information. Can be either a string message or an array of error objects.
 * @returns {Array<Object>} An array of error objects. Each object has a 'message' property.
 * @throws {Error} Throws an error if errorData is neither a string nor an array.
 *
 */
export function collectAndReturnViolation(path, ruleName, errorData) {
  collector.add(EntryType.VIOLATION, path, ruleName);

  if (typeof errorData === 'string') {
    return [{ message: errorData }];
  } else if (Array.isArray(errorData)) {
    return errorData;
  } else {
    throw new Error('Invalid error data type. Expected string or array.');
  }
}

/**
 * Collects an adoption entry.
 *
 * @param {string} path - The JSON path for the object where the rule adoption occurred.
 * @param {string} ruleName - The name of the rule that was adopted.
 */
export function collectAdoption(path, ruleName) {
  collector.add(EntryType.ADOPTION, path, ruleName);
}

/**
 * Collects an exception entry.
 *
 * @param object the object to evaluate
 * @param {string} path - The JSON path for the object where the rule exception occurred.
 * @param {string} ruleName - The name of the rule that the exception is defined for.
 */
export function collectException(object, ruleName, path) {
  const EXCEPTION_EXTENSION = 'x-xgen-IPA-exception';
  let exceptionReason = object[EXCEPTION_EXTENSION][ruleName];
  if (exceptionReason) {
    collector.add(EntryType.EXCEPTION, path, ruleName, exceptionReason);
  }
}
