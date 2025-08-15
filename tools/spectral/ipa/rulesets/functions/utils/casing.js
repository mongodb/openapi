/**
 * Check if a string is in title case.
 * @param {string} str the string to check
 * @param {Array<string>} ignoreList list of words to ignore (e.g. abbreviations, acronyms)
 * @param {Array<string>} grammaticalWords list of grammatical words that must be lowercase (e.g., "and", "or", "the")
 * @returns {boolean} true if the string is in title case, false otherwise
 */
export function isTitleCase(str, ignoreList, grammaticalWords) {
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
