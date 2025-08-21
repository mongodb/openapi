import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE =
  'Descriptions should not include inline links. Use the externalDocumentation property instead, see https://swagger.io/specification/#external-documentation-object.';

export default (input, opts, { path, rule }) => {
  const ruleName = rule.name;
  // Ignore missing descriptions
  if (!input['description']) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};

function checkViolationsAndReturnErrors(description, path, ruleName) {
  const markdownLinkPattern = new RegExp(`\\[.+]\\(.+\\)`);

  try {
    if (markdownLinkPattern.test(description)) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
