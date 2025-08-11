import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  evaluateAndCollectAdoptionStatus,
  evaluateAndCollectAdoptionStatusWithoutExceptions,
} from '../../rulesets/functions/utils/collectionUtils.js';
import collector from '../../metrics/collector.js';

const TEST_ERROR_MESSAGE = 'error message';
const TEST_ENTRY_TYPE = {
  EXCEPTION: 'exceptions',
  VIOLATION: 'violations',
  ADOPTION: 'adoptions',
};

jest.mock('../../metrics/collector.js', () => {
  return {
    getInstance: jest.fn(),
    add: jest.fn(),
    EntryType: TEST_ENTRY_TYPE,
  };
});

describe('tools/spectral/ipa/rulesets/functions/utils/collectionUtils.js', () => {
  describe('collectExceptionAdoptionViolations', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns errors and collects violations when there are errors', () => {
      const testRuleName = 'xgen-IPA-XXX-rule';
      const testPath = ['paths', '/resource'];
      const testObject = {
        get: {},
      };
      const testErrors = [
        {
          path: testPath,
          message: TEST_ERROR_MESSAGE,
        },
      ];

      const result = evaluateAndCollectAdoptionStatus(testErrors, testRuleName, testObject, testPath);

      expect(result).toEqual(testErrors);
      expect(collector.add).toHaveBeenCalledTimes(1);
      expect(collector.add).toHaveBeenCalledWith(TEST_ENTRY_TYPE.VIOLATION, testPath, testRuleName);
    });

    it('returns errors and collects violations when there are errors - ignores exception for another rule', () => {
      const testRuleName = 'xgen-IPA-XXX-rule';
      const testPath = ['paths', '/resource'];
      const testObject = {
        get: {},
        'x-xgen-IPA-exception': {
          'xgen-IPA-XXX-some-other-rule': 'reason',
        },
      };
      const testErrors = [
        {
          path: testPath,
          message: TEST_ERROR_MESSAGE,
        },
      ];

      const result = evaluateAndCollectAdoptionStatus(testErrors, testRuleName, testObject, testPath);

      expect(result).toEqual(testErrors);
      expect(collector.add).toHaveBeenCalledTimes(1);
      expect(collector.add).toHaveBeenCalledWith(TEST_ENTRY_TYPE.VIOLATION, testPath, testRuleName);
    });

    it('returns empty and collects adoptions when there are no errors', () => {
      const testRuleName = 'xgen-IPA-XXX-rule';
      const testPath = ['paths', '/resource'];
      const testObject = {
        get: {},
      };
      const testNoErrors = [];

      const result = evaluateAndCollectAdoptionStatus(testNoErrors, testRuleName, testObject, testPath);

      expect(result).toEqual(undefined);
      expect(collector.add).toHaveBeenCalledTimes(1);
      expect(collector.add).toHaveBeenCalledWith(TEST_ENTRY_TYPE.ADOPTION, testPath, testRuleName);
    });

    it('returns empty and collects exceptions when there are errors and exceptions', () => {
      const testRuleName = 'xgen-IPA-XXX-rule';
      const testPath = ['paths', '/resource'];
      const testObject = {
        get: {},
        'x-xgen-IPA-exception': {
          'xgen-IPA-XXX-rule': 'reason',
        },
      };
      const testErrors = [
        {
          path: testPath,
          message: TEST_ERROR_MESSAGE,
        },
      ];

      const result = evaluateAndCollectAdoptionStatus(testErrors, testRuleName, testObject, testPath);

      expect(result).toEqual(undefined);
      expect(collector.add).toHaveBeenCalledTimes(1);
      expect(collector.add).toHaveBeenCalledWith(TEST_ENTRY_TYPE.EXCEPTION, testPath, testRuleName, 'reason');
    });

    it('returns error when there are exceptions and no errors', () => {
      const testRuleName = 'xgen-IPA-XXX-rule';
      const testPath = ['paths', '/resource'];
      const testObject = {
        get: {},
        'x-xgen-IPA-exception': {
          'xgen-IPA-XXX-rule': 'reason',
        },
      };

      const result = evaluateAndCollectAdoptionStatus([], testRuleName, testObject, testPath);

      expect(result.length).toEqual(1);
      expect(Object.keys(result[0])).toEqual(['path', 'message']);
      expect(result[0].path).toEqual([...testPath, 'x-xgen-IPA-exception', testRuleName]);
      expect(result[0].message).toEqual(
        'This component adopts the rule and does not need an exception. Please remove the exception.'
      );
      expect(collector.add).toHaveBeenCalledTimes(1);
      expect(collector.add).toHaveBeenCalledWith(TEST_ENTRY_TYPE.VIOLATION, testPath, testRuleName);
    });
  });

  describe('evaluateAndCollectAdoptionStatusWithoutExceptions', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns errors and collects violations when there are errors', () => {
      const testRuleName = 'xgen-IPA-XXX-rule';
      const testPath = ['paths', '/resource'];
      const testErrors = [
        {
          path: testPath,
          message: TEST_ERROR_MESSAGE,
        },
      ];

      const result = evaluateAndCollectAdoptionStatusWithoutExceptions(testErrors, testRuleName, testPath);

      expect(result).toEqual(testErrors);
      expect(collector.add).toHaveBeenCalledTimes(1);
      expect(collector.add).toHaveBeenCalledWith(TEST_ENTRY_TYPE.VIOLATION, testPath, testRuleName);
    });

    it('returns empty and collects adoptions when there are no errors', () => {
      const testRuleName = 'xgen-IPA-XXX-rule';
      const testPath = ['paths', '/resource'];
      const testNoErrors = [];

      const result = evaluateAndCollectAdoptionStatusWithoutExceptions(testNoErrors, testRuleName, testPath);

      expect(result).toEqual(undefined);
      expect(collector.add).toHaveBeenCalledTimes(1);
      expect(collector.add).toHaveBeenCalledWith(TEST_ENTRY_TYPE.ADOPTION, testPath, testRuleName);
    });
  });
});
