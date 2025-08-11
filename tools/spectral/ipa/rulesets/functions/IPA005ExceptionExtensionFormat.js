import { evaluateAndCollectAdoptionStatusWithoutExceptions, handleInternalError } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-005-exception-extension-format';
const ERROR_MESSAGE = 'IPA exceptions must have a valid rule name and a reason.';
const RULE_NAME_PREFIX = 'xgen-IPA-';

// Note: This rule does not allow exceptions
export default (input, _, { path }) => {
  const errors = checkViolationsAndReturnErrors(input, path);
  return evaluateAndCollectAdoptionStatusWithoutExceptions(errors, RULE_NAME, path);
};

function isValidException(ruleName, reason) {
  return ruleName.startsWith(RULE_NAME_PREFIX) && typeof reason === 'string' && reason !== '';
}

function checkViolationsAndReturnErrors(input, path) {
  const errors = [];
  try {
    const exemptedRules = Object.keys(input);
    exemptedRules.forEach((ruleName) => {
      const reason = input[ruleName];
      if (!isValidException(ruleName, reason)) {
        errors.push({
          path: path.concat([ruleName]),
          message: ERROR_MESSAGE,
        });
      }
    });
    return errors;
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
