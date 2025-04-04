import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-126-tag-names-should-use-title-case';

export default (input, { ignoreList }, { path }) => {
  const tagName = input.name;
  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  // Check if the tag name uses Title Case
  if (!isTitleCase(tagName, ignoreList)) {
    return collectAndReturnViolation(path, RULE_NAME, [
      {
        path,
        message: `Tag name should use Title Case, found: "${tagName}".`,
      },
    ]);
  }

  // Tag name uses Title Case
  collectAdoption(path, RULE_NAME);
};

function isTitleCase(str, ignoreList) {
  // Split by spaces to check each word/word-group
  const words = str.split(' ');

  return words.every((wordGroup) => {
    // For hyphenated words, check each part
    if (wordGroup.includes('-')) {
      const hyphenatedParts = wordGroup.split('-');
      return hyphenatedParts.every((part) => {
        if (part === '') return true; // Skip empty parts
        if (ignoreList.includes(part)) return true;
        // First character should be uppercase, rest lowercase, all alphabetical
        return /^[A-Z][a-z]*$/.test(part);
      });
    }

    // For regular words
    if (wordGroup === '') return true;
    if (ignoreList.includes(wordGroup)) return true;
    return /^[A-Z][a-z]*$/.test(wordGroup);
  });
}
