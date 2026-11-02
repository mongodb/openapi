// @ts-check
// Builds the valid-operation-id and operation-id-length rules of the standard methods. Kept out of utils/conditions,
// which tooling loads outside Spectral: operationIdGeneration.js only loads through Spectral's bundler.

import { defineRule } from './defineRule.js';
import { getMethodName } from './conditions/operationIdRules.js';
import { generateOperationID } from './operationIdGeneration.js';
import {
  validateOperationIdAndReturnErrors,
  validateOperationIdLengthAndReturnErrors,
} from './validations/validateOperationIdAndReturnErrors.js';

// A verb override without a `verb` fails the lint run, as it did before these rules were built with defineRule
const verbOverrideIsReadable = ({ input, options }) => getMethodName(input, options.methodName);

/**
 * Builds a rule checking that the operation ID is the one generated from the method and the path. The verb is the rule's
 * `methodName` option, or the operation's verb override.
 *
 * @param {Array<import('./conditions/registry.js').Condition>} appliesTo which operations are the rule's method
 */
export function validOperationIdRule(appliesTo) {
  return defineRule({
    appliesTo,
    onInternalError: 'return',
    beforeCheck: verbOverrideIsReadable,
    check: ({ input, options, path, resourcePath }) =>
      validateOperationIdAndReturnErrors(
        getMethodName(input, options.methodName),
        resourcePath,
        input,
        path,
        options.ignoreSingularizationList
      ),
  });
}

/**
 * Builds a rule checking that the operation ID, or its `x-xgen-operation-id-override`, is at most `maxLength` words.
 *
 * @param {Array<import('./conditions/registry.js').Condition>} appliesTo which operations are the rule's method
 */
export function operationIdLengthRule(appliesTo) {
  return defineRule({
    appliesTo,
    onInternalError: 'return',
    beforeCheck: verbOverrideIsReadable,
    check: ({ input, options, path, resourcePath }) => {
      // The generated ID is only used to suggest a shorter override in the message
      const expectedOperationId = generateOperationID(
        getMethodName(input, options.methodName),
        resourcePath,
        options.ignoreSingularizationList
      );
      return validateOperationIdLengthAndReturnErrors(input, path, expectedOperationId, options.maxLength);
    },
  });
}
