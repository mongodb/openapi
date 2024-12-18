const ERROR_MESSAGE = 'IPA exceptions must have a valid rule name and a reason.';
const RULE_NAME_PREFIX = 'xgen-IPA-';
const REASON_KEY = 'reason';

// Note: This rule does not allow exceptions
export default (input, _, { path }) => {
  const exemptedRules = Object.keys(input);
  const errors = [];

  exemptedRules.forEach((ruleName) => {
    const exception = input[ruleName];
    if (!isValidException(ruleName, exception)) {
      errors.push({
        path: path.concat([ruleName]),
        message: ERROR_MESSAGE,
      });
    }
  });

  return errors;
};

function isValidException(ruleName, exception) {
  const exceptionObjectKeys = Object.keys(exception);
  return (
    ruleName.startsWith(RULE_NAME_PREFIX) &&
    exceptionObjectKeys.length === 1 &&
    exceptionObjectKeys.includes(REASON_KEY) &&
    exception[REASON_KEY] !== ''
  );
}
