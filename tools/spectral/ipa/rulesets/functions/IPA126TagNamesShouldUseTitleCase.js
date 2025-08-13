import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-126-tag-names-should-use-title-case';

export default (input, { ignoreList, grammaticalWords }, { path }) => {
  const tagName = input.name;

  // Check if the tag name uses Title Case
  let errors = [];
  if (!isTitleCase(tagName, ignoreList, grammaticalWords)) {
    errors = [
      {
        path,
        message: `Tag name should use Title Case, found: "${tagName}".`,
      },
    ];
  }

  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function isTitleCase(str, ignoreList, grammaticalWords) {
  // Split by spaces to check each word/word-group
  // First character should be uppercase, rest lowercase, all alphabetical
  const words = str.split(' ');

  return words.every((wordGroup, index) => {
    // For hyphenated words, check each part
    if (wordGroup.includes('-')) {
      const hyphenatedParts = wordGroup.split('-');
      return hyphenatedParts.every((part) => {
        if (ignoreList.includes(part)) return true;
        return /^[A-Z][a-z]*$/.test(part);
      });
    }

    // For regular words
    if (ignoreList.includes(wordGroup)) return true;
    if (index !== 0 && grammaticalWords.includes(wordGroup)) return true;
    return /^[A-Z][a-z]*$/.test(wordGroup);
  });
}
