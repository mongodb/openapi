import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-description-should-not-use-inline-links';
const ERROR_MESSAGE =
  'Descriptions should not include inline links. Use the externalDocumentation property instead, see https://swagger.io/specification/#external-documentation-object.';

export default (input, opts, { path }) => {
  // Ignore missing descriptions
  if (!input['description']) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(description, path) {
  const markdownLinkPattern = new RegExp(`\\[.+]\\(.+\\)`);

  try {
    if (markdownLinkPattern.test(description)) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
