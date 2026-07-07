import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isTitleCase } from './utils/casing.js';
import { GRAMMATICAL_WORDS, IGNORE_LIST } from './utils/grammaticalWordsAndIgnoreList.js';

export default (input, _, { path, rule }) => {
  const ruleName = rule.name;
  const tagName = input.name;

  // Check if the tag name uses Title Case
  let errors = [];
  if (!isTitleCase(tagName, IGNORE_LIST, GRAMMATICAL_WORDS)) {
    errors = [
      {
        path,
        message: `Tag name should use Title Case, found: "${tagName}".`,
      },
    ];
  }

  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};
