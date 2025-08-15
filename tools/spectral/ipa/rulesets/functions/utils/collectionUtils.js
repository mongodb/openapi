import collector, { EntryType } from '../../../metrics/collector.js';
import { EXCEPTION_EXTENSION, getUnnecessaryExceptionError, hasException } from './exceptions.js';

/**
 * Evaluates and collects adoptions, exceptions and violations based on the rule, evaluated object and the validation errors.
 * If the object is violating the rule, but has an exception, the validation error is ignored
 * If the object is adopting the rule, but has an exception, an unnecessary exception error is returned, but the object is counted as adopting the rule
 *
 * @param {Array<{path: Array<string>, message: string}>} validationErrors the error results from the rule
 * @param {string} ruleName the name of the rule
 * @param {*} object the object evaluated for the rule, should contain an exception object if an exception is needed
 * @param {Array<string>} objectPath the JSON path to the object
 * @returns {Array<{path: Array<string>, message: string}>|undefined} an array of the validation errors, or undefined if there are no errors
 */
export function evaluateAndCollectAdoptionStatus(validationErrors, ruleName, object, objectPath) {
  if (validationErrors.length !== 0) {
    if (hasException(object, ruleName)) {
      collectException(object, ruleName, objectPath);
      return;
    }
    return collectAndReturnViolation(objectPath, ruleName, validationErrors);
  }
  collectAdoption(objectPath, ruleName);

  if (hasException(object, ruleName)) {
    return returnViolation(getUnnecessaryExceptionError(objectPath, ruleName));
  }
}

/**
 * Evaluates and collects adoptions and violations based on the rule, evaluated object and the validation errors.
 * No exceptions are allowed.
 *
 * @param {Array<{path: Array<string>, message: string}>} validationErrors the error results from the rule
 * @param {string} ruleName the name of the rule
 * @param {Array<string>} objectPath the JSON path to the object
 * @returns {Array<{path: Array<string>, message: string}>|undefined} an array of the validation errors, or undefined if there are no errors
 */
export function evaluateAndCollectAdoptionStatusWithoutExceptions(validationErrors, ruleName, objectPath) {
  if (validationErrors.length !== 0) {
    return collectAndReturnViolation(objectPath, ruleName, validationErrors);
  }
  collectAdoption(objectPath, ruleName);
}

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
function collectAndReturnViolation(jsonPath, ruleName, errorData) {
  collector.add(EntryType.VIOLATION, jsonPath, ruleName);

  return returnViolation(errorData);
}

export function returnViolation(errorData) {
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
 * @param {Array<string>} jsonPath - The JSON path array for the object where the rule violation occurred. Example: ["paths","./pets","get"]
 * @param {string} ruleName - The name of the rule that was adopted.
 */
function collectAdoption(jsonPath, ruleName) {
  collector.add(EntryType.ADOPTION, jsonPath, ruleName);
}

/**
 * Collects an exception entry.
 *
 * @param object the object to evaluate
 * @param {Array<string>} jsonPath - The JSON path array for the object where the rule violation occurred. Example: ["paths","./pets","get"]
 * @param {string} ruleName - The name of the rule that the exception is defined for.
 */
function collectException(object, ruleName, jsonPath) {
  let exceptionReason = object[EXCEPTION_EXTENSION][ruleName];
  if (exceptionReason) {
    collector.add(EntryType.EXCEPTION, jsonPath, ruleName, exceptionReason);
  }
}

/**
 * Creates internal rule error entry for the collector in order to not fail validation process.
 * @param {string} ruleName - The name of the rule that was adopted.
 * @param {Array<string>} jsonPathArray - The JSON path for the object where the rule exception occurred.
 * @param {string} error - The error message
 */
export function handleInternalError(ruleName, jsonPathArray, error) {
  return [
    {
      path: jsonPathArray,
      message: `${ruleName} Internal Rule Error: ${error} Please report issue in https://github.com/mongodb/openapi/issues`,
    },
  ];
}
