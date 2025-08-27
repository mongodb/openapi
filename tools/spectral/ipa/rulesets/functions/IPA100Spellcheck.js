import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';

import spellcheck from 'markdown-spellcheck';

export default (input, { customWords, spellcheckOptions }, { path, rule }) => {
  if (typeof input !== 'string') {
    return;
  }
  const errors = checkViolationsAndReturnErrors(input, customWords, spellcheckOptions, path, rule.name);
  return evaluateAndCollectAdoptionStatus(errors, rule.name, input, path);
};

function checkViolationsAndReturnErrors(text, customWords, spellcheckOptions, path, ruleName) {
  try {
    const errors = [];
    const results = spellcheck.spell(text, spellcheckOptions);
    results.forEach((error) => {
      if (!customWords.includes(error.word)) {
        errors.push({
          path,
          message: `Spelling error: "${error.word}" at position ${error.index}`,
        });
      }
    });
    if (errors.length !== 0) {
      console.log('input\t', text, '\n');
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
