import collector, { EntryType } from '../../../metrics/collector.js';
import { EXCEPTION_EXTENSION } from './exceptions.js';

/**
 * Collects a violation entry and returns formatted error data.
 *
 * @param {Array<string>} jsonPath - The JSON path array for the object where the rule violation occurred. Example: ["paths","./pets","get"]
 * @param {string} ruleName - The name of the rule that was violated.
 * @param {string|Array<Object>} errorData - The error information. Can be either a string message or an array of error objects.
 * @returns {Array<Object>} An array of error objects. Each object has a 'message' property.
 * @throws {Error} Throws an error if errorData is neither a string nor an array.
 *
 */
export function collectAndReturnViolation(jsonPath, ruleName, errorData) {
  collector.add(EntryType.VIOLATION, jsonPath, ruleName);

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
 * @param {Array<string>} path - The JSON path for the object where the rule adoption occurred.
 * @param {string} ruleName - The name of the rule that was adopted.
 */
export function collectAdoption(jsonPath, ruleName) {
  collector.add(EntryType.ADOPTION, jsonPath, ruleName);
}

/**
 * Collects an exception entry.
 *
 * @param object the object to evaluate
 * @param {Array<string>} path - The JSON path for the object where the rule exception occurred.
 * @param {string} ruleName - The name of the rule that the exception is defined for.
 */
export function collectException(object, ruleName, jsonPath) {
  let exceptionReason = object[EXCEPTION_EXTENSION][ruleName];
  if (exceptionReason) {
    collector.add(EntryType.EXCEPTION, jsonPath, ruleName, exceptionReason);
  }
}
