import collector, { EntryType } from '../../metrics/collector.js';

const RULE_NAME = 'xgen-IPA-005-exception-extension-format';
const ERROR_MESSAGE = 'IPA exceptions must have a valid rule name and a reason.';
const RULE_NAME_PREFIX = 'xgen-IPA-';

// Note: This rule does not allow exceptions
export default (input, _, { path }) => {
  const exemptedRules = Object.keys(input);
  const errors = [];

  exemptedRules.forEach((ruleName) => {
    const reason = input[ruleName];
    if (!isValidException(ruleName, reason)) {
      errors.push({
        path: path.concat([ruleName]),
        message: ERROR_MESSAGE,
      });
    }
  });

  if(errors.length === 0) {
    collector.add(path, RULE_NAME, EntryType.ADOPTION);
  } else {
    collector.add(path, RULE_NAME, EntryType.VIOLATION);
  }

  return errors;
};

function isValidException(ruleName, reason) {
  return ruleName.startsWith(RULE_NAME_PREFIX) && typeof reason === 'string' && reason !== '';
}
