import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { isTitleCase } from './utils/casing.js';

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
