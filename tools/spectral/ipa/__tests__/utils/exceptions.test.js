import { describe, expect, it } from '@jest/globals';
import { hasException } from '../../rulesets/functions/utils/exceptions';

const TEST_RULE_NAME_100 = 'xgen-IPA-100';

const objectWithIpa100Exception = {
  'x-xgen-IPA-exception': {
    'xgen-IPA-100': 'reason',
  },
};

const objectWithNestedIpa100Exception = {
  get: {
    'x-xgen-IPA-exception': {
      'xgen-IPA-100': 'reason',
    },
  },
};

const objectWithIpa100ExceptionAndOwnerExtension = {
  'x-xgen-IPA-exception': {
    'xgen-IPA-100': 'reason',
  },
  'x-xgen-owner-team': 'apix',
};

const objectWithIpa101Exception = {
  'x-xgen-IPA-exception': {
    'xgen-IPA-101': 'reason',
  },
};

const objectWithIpa100And101Exception = {
  'x-xgen-IPA-exception': {
    'xgen-IPA-101': 'reason',
    'xgen-IPA-100': 'reason',
  },
};

describe('tools/spectral/ipa/rulesets/functions/utils/exceptions.js', () => {
  describe('hasException', () => {
    it('returns true if object has exception matching the rule name', () => {
      expect(hasException(objectWithIpa100Exception, TEST_RULE_NAME_100)).toBe(true);
      expect(hasException(objectWithIpa100ExceptionAndOwnerExtension, TEST_RULE_NAME_100)).toBe(true);
      expect(hasException(objectWithIpa100And101Exception, TEST_RULE_NAME_100)).toBe(true);
    });
    it('returns false if object does not have exception matching the rule name', () => {
      expect(hasException({}, TEST_RULE_NAME_100)).toBe(false);
      expect(hasException(objectWithIpa101Exception, TEST_RULE_NAME_100)).toBe(false);
    });
    it('returns false if object has nested exception matching the rule name', () => {
      expect(hasException(objectWithNestedIpa100Exception, TEST_RULE_NAME_100)).toBe(false);
    });
  });
});
