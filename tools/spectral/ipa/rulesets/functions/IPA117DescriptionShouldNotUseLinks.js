import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-description-should-not-use-inline-links';
const ERROR_MESSAGE =
  'Descriptions should not include inline links. Use the externalDocumentation property instead, see https://swagger.io/specification/#external-documentation-object.';

export default (input, opts, { path }) => {
  // Ignore missing descriptions
  if (!input['description']) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input['description'], path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(description, path) {
  const markdownLinkPattern = new RegExp(`\\[.+]\\(.+\\)`);

  try {
    if (markdownLinkPattern.test(description)) {
      console.log(description, '\n\n');
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
