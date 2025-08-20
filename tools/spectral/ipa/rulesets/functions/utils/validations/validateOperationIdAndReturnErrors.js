import { generateOperationID, numberOfWords, shortenOperationId } from '../operationIdGeneration.js';
import { getOperationIdOverride, hasOperationIdOverride, OPERATION_ID_OVERRIDE_EXTENSION } from '../extensions.js';

const CAMEL_CASE = /[A-Z]?[a-z]+/g;

const INVALID_OP_ID_ERROR_MESSAGE = 'Invalid OperationID.';
const TOO_LONG_OP_ID_ERROR_MESSAGE =
  "The Operation ID is longer than 4 words. Please add an '" +
  OPERATION_ID_OVERRIDE_EXTENSION +
  "' extension to the operation with a shorter operation ID.";

/**
 * Validates the operationId of an operation object and returns errors if it does not match the expected format. Also validates that the operationId override, if present, follows the expected rules.
 *
 * @param methodName the method name (e.g. 'get', 'post', etc.). For custom methods, this is the custom method name. For legacy custom methods, this is an empty string.
 * @param resourcePath the resource path for the endpoint (e.g. '/users', '/users/{userId}', etc.). For custom methods, this is the path without the custom method name.
 * @param operationObject the operation object to validate, which should contain the operationId and optionally the x-xgen-operation-id-override extension.
 * @param path the path to the operation object being evaluated, used for error reporting with Spectral.
 * @returns {[{path: string[], message: string}]} an array of error objects, each containing a path and a message, or an empty array if no errors are found.
 */
export function validateOperationIdAndReturnErrors(
  methodName,
  resourcePath,
  operationObject,
  path,
  ignorePluralizationList
) {
  const operationId = operationObject.operationId;
  const expectedOperationId = generateOperationID(methodName, resourcePath, ignorePluralizationList);

  const operationIdPath = path.concat(['operationId']);

  const errors = [];
  if (expectedOperationId !== operationId) {
    errors.push({
      path: operationIdPath,
      message: `${INVALID_OP_ID_ERROR_MESSAGE} Found '${operationId}', expected '${expectedOperationId}'.`,
    });
  }

  const operationIdOverridePath = path.concat([OPERATION_ID_OVERRIDE_EXTENSION]);
  if (numberOfWords(operationId) > 4 && !hasOperationIdOverride(operationObject)) {
    errors.push({
      path: operationIdPath,
      message: TOO_LONG_OP_ID_ERROR_MESSAGE + " For example: '" + shortenOperationId(expectedOperationId) + "'.",
    });
    return errors;
  }

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

function validateOperationIdOverride(operationIdOverridePath, override, expectedOperationId) {
  const expectedVerb = expectedOperationId.match(CAMEL_CASE)[0];
  const errors = [];
  if (!override.startsWith(expectedVerb)) {
    errors.push({
      path: operationIdOverridePath,
      message: `The operation ID override must start with the verb '${expectedVerb}'.`,
    });
  }

  if (numberOfWords(override) > 4) {
    errors.push({
      path: operationIdOverridePath,
      message: `The operation ID override is longer than 4 words. Please shorten it.`,
    });
  }

  const overrideWords = override.match(CAMEL_CASE).slice(1);
  if (overrideWords.some((word) => !expectedOperationId.includes(word))) {
    errors.push({
      path: operationIdOverridePath,
      message: `The operation ID override must only contain nouns from the operation ID '${expectedOperationId}'.`,
    });
  }

  const expectedLastNoun = expectedOperationId.match(CAMEL_CASE)[numberOfWords(expectedOperationId) - 1];
  if (!override.endsWith(expectedLastNoun)) {
    errors.push({
      path: operationIdOverridePath,
      message: `The operation ID override must end with the noun '${expectedLastNoun}'.`,
    });
  }

  return errors;
}
