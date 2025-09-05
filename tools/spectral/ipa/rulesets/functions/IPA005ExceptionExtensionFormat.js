import {
  evaluateAndCollectAdoptionStatusWithoutExceptions,
  handleInternalError,
} from './utils/collectionUtils.js';

const ERROR_MESSAGE_RULENAME_FORMAT =
  'IPA exceptions must have a valid key following xgen-IPA-XXX or xgen-IPA-XXX-{rule-name} format.';
const ERROR_MESSAGE_REASON_FORMAT =
  'IPA exceptions must have a non-empty reason that starts with uppercase and ends with a full stop.';
const RULE_NAME_PATTERN = /^xgen-IPA-\d{3}(?:-[a-zA-Z0-9-]+)?$/;

// Note: This rule does not allow exceptions
export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatusWithoutExceptions(errors, ruleName, path);
};

function isRuleNameValid(ruleName) {
  return RULE_NAME_PATTERN.test(ruleName);
}

function isReasonFormatValid(reason) {
  if (reason === null || reason === undefined || typeof reason !== 'string' || reason === '') {
    return false;
  }
  // Check if reason starts with uppercase letter
  if (!/^[A-Z]/.test(reason)) {
    return false;
  }

  // Check if reason ends with a full stop
  if (!reason.endsWith('.')) {
    return false;
  }
  return true;
}

function checkViolationsAndReturnErrors(input, path, ruleName) {
  const errors = [];
  try {
    const exemptedRules = Object.keys(input);
    exemptedRules.forEach((key) => {
      const reason = input[key];
      if (!isRuleNameValid(key)) {
        errors.push({
          path: path.concat([ruleName]),
          message: ERROR_MESSAGE_RULENAME_FORMAT,
        });
      } else {
        if (!isReasonFormatValid(reason)) {
          errors.push({
            path: path.concat([ruleName]),
            message: ERROR_MESSAGE_REASON_FORMAT,
          });
        }
      }
    });
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
