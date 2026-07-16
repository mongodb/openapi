import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isTitleCase } from './utils/casing.js';

export default (input, { ignoreList, grammaticalWords }, { path, rule }) => {
  const ruleName = rule.name;
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

  return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
};
