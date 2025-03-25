import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-117-description-must-not-use-html';
const ERROR_MESSAGE = 'Descriptions must not use raw HTML.';

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
  const htmlTagPattern = new RegExp(`<.*>.*</.*>`);
  const htmlTagSelfClosingPattern = new RegExp(`<.*/>`);
  const linkHtmlPattern = new RegExp(`<a.*>.*</a>`);

  try {
    if (htmlTagPattern.test(description) || htmlTagSelfClosingPattern.test(description)) {
      if (linkHtmlPattern.test(description)) {
        return [
          {
            path,
            message: `${ERROR_MESSAGE} If you want to link to additional documentation, please use the externalDocumentation property (https://swagger.io/specification/#external-documentation-object).`,
          },
        ];
      }
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
