import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

const ERROR_MESSAGE = 'Descriptions must not use raw HTML.';

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
    return handleInternalError(ruleName, path, e);
  }
}
