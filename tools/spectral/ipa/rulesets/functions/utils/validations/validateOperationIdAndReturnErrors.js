import {
  CAMEL_CASE_WITH_ABBREVIATIONS,
  generateOperationID,
  numberOfWords,
  shortenOperationId,
} from '../operationIdGeneration.js';
import {
  getOperationIdOverride,
  hasOperationIdOverride,
  OPERATION_ID_OVERRIDE_EXTENSION,
} from '../extensions.js';

const INVALID_OP_ID_ERROR_MESSAGE = 'Invalid OperationID.';

/**
 * Validates the length of an operationId and its override (if present) and returns errors if either is longer than the specified maximum.
 *
 * @param operationObject the operation object to validate, which should contain the operationId and optionally the x-xgen-operation-id-override extension.
 * @param path the path to the operation object being evaluated, used for error reporting with Spectral.
 * @param expectedOperationId the expected IPA-compliant operation ID (used for generating example shortened ID).
 * @param maxLength the maximum number of words allowed in the operation ID and override (default: 4).
 * @returns {[{path: string[], message: string}]} an array of error objects, each containing a path and a message, or an empty array if no errors are found.
 */
export function validateOperationIdLengthAndReturnErrors(operationObject, path, expectedOperationId, maxLength = 4) {
  const operationId = operationObject.operationId;
  const operationIdPath = path.concat(['operationId']);

  const errors = [];

  // Check operation ID length only if no override exists
  if (numberOfWords(operationId) > maxLength && !hasOperationIdOverride(operationObject)) {
    const tooLongOpIdErrorMessage =
      `The Operation ID is longer than ${maxLength} words. Please add an '` +
      OPERATION_ID_OVERRIDE_EXTENSION +
      "' extension to the operation with a shorter operation ID.";
    errors.push({
      path: operationIdPath,
      message: tooLongOpIdErrorMessage + " For example: '" + shortenOperationId(expectedOperationId) + "'.",
    });
  }

  // Check override length if override exists
  if (hasOperationIdOverride(operationObject)) {
    const override = getOperationIdOverride(operationObject);
    const operationIdOverridePath = path.concat([OPERATION_ID_OVERRIDE_EXTENSION]);

    if (numberOfWords(override) > maxLength) {
      errors.push({
        path: operationIdOverridePath,
        message: `The operation ID override is longer than ${maxLength} words. Please shorten it.`,
      });
    }
  }

  return errors;
}

/**
 * Validates the operationId of an operation object and returns errors if it does not match the expected format. Also validates that the operationId override, if present, follows the expected format rules (but not length - length is checked by validateOperationIdLengthAndReturnErrors).
 *
 * @param methodName the method name (e.g. 'get', 'post', etc.). For custom methods, this is the custom method name. For legacy custom methods, this is an empty string.
 * @param resourcePath the resource path for the endpoint (e.g. '/users', '/users/{userId}', etc.). For custom methods, this is the path without the custom method name.
 * @param operationObject the operation object to validate, which should contain the operationId and optionally the x-xgen-operation-id-override extension.
 * @param path the path to the operation object being evaluated, used for error reporting with Spectral.
 * @param ignoreSingularizationList an array of nouns to ignore when singularizing resource names.
 * @returns {[{path: string[], message: string}]} an array of error objects, each containing a path and a message, or an empty array if no errors are found.
 */
export function validateOperationIdAndReturnErrors(
  methodName,
  resourcePath,
  operationObject,
  path,
  ignoreSingularizationList
) {
  const operationId = operationObject.operationId;
  const expectedOperationId = generateOperationID(methodName, resourcePath, ignoreSingularizationList);

  const operationIdPath = path.concat(['operationId']);

  const errors = [];
  if (expectedOperationId !== operationId) {
    errors.push({
      path: operationIdPath,
      message: `${INVALID_OP_ID_ERROR_MESSAGE} Found '${operationId}', expected '${expectedOperationId}'.`,
    });
  }

  const operationIdOverridePath = path.concat([OPERATION_ID_OVERRIDE_EXTENSION]);
  if (hasOperationIdOverride(operationObject)) {
    const overrideErrors = validateOperationIdOverride(
      operationIdOverridePath,
      getOperationIdOverride(operationObject),
      expectedOperationId
    );
    errors.push(...overrideErrors);
  }

  return errors;
}

/**
 * Validates the format/structure of an operation ID override (but not its length - length is validated by validateOperationIdLengthAndReturnErrors).
 *
 * @param operationIdOverridePath the path to the override extension
 * @param override the override value
 * @param expectedOperationId the expected operation ID
 * @returns {[{path: string[], message: string}]} an array of error objects, or an empty array if no errors are found
 */
function validateOperationIdOverride(operationIdOverridePath, override, expectedOperationId) {
  const expectedVerb = expectedOperationId.match(CAMEL_CASE_WITH_ABBREVIATIONS)[0];
  const errors = [];

  if (!override.startsWith(expectedVerb)) {
    errors.push({
      path: operationIdOverridePath,
      message: `The operation ID override must start with the verb '${expectedVerb}'.`,
    });
  }

  const overrideWords = override.match(CAMEL_CASE_WITH_ABBREVIATIONS).slice(1);
  if (overrideWords.some((word) => !expectedOperationId.includes(word))) {
    errors.push({
      path: operationIdOverridePath,
      message: `The operation ID override must only contain nouns from the operation ID '${expectedOperationId}'.`,
    });
  }

  const expectedLastNoun =
    expectedOperationId.match(CAMEL_CASE_WITH_ABBREVIATIONS)[numberOfWords(expectedOperationId) - 1];
  if (!override.endsWith(expectedLastNoun)) {
    errors.push({
      path: operationIdOverridePath,
      message: `The operation ID override must end with the noun '${expectedLastNoun}'.`,
    });
  }

  return errors;
}
