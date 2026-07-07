import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isTitleCase } from './utils/casing.js';
import { IPA_126_GRAMMATICAL_WORDS, IPA_126_IGNORE_LIST } from './utils/grammaticalWordsAndIgnoreList.js';

export default (input, options, { path, rule }) => {
  const ruleName = rule.name;
  const tagName = input.name;

  // Check if the tag name uses Title Case
  let errors = [];
  if (!isTitleCase(tagName, IPA_126_IGNORE_LIST, IPA_126_GRAMMATICAL_WORDS)) {
    errors = [
      {
        path,
        message: `Tag name should use Title Case, found: "${tagName}".`,
      },
    ];
  }

  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};
