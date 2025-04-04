import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { casing } from '@stoplight/spectral-functions';

const RULE_NAME = 'xgen-IPA-126-tag-names-should-use-title-case';

export default (input, options, { path }) => {
  const tagName = input.name;
  if (!tagName || tagName.trim().length === 0) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  // Check if the tag name uses Title Case
  if (casing(tagName, { type: 'pascal', disallowDigits: true, separator: { char: ' ' } })) {
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
