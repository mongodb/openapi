import { describe, it, expect } from '@jest/globals';
import {
  hasCustomMethodOverride,
  hasMethodVerbOverride,
  hasOperationIdOverride,
  getOperationIdOverride,
  hasVerbOverride,
} from '../../rulesets/functions/utils/extensions';

const operationWithVerbOverride = {
  'x-xgen-method-verb-override': {
    verb: 'get',
    customMethod: false,
  },
};

const operationWithCustomMethodVerbOverride = {
  'x-xgen-method-verb-override': {
    verb: 'add',
    customMethod: true,
  },
};

const operationWithOperationIdOverride = {
  operationId: 'operationId',
  'x-xgen-operation-id-override': 'customOperationId',
};

const operationWithEmptyOperationIdOverride = {
  operationId: 'operationId',
  'x-xgen-operation-id-override': '',
};

const operationWithNoOverrides = {
  operationId: 'operationId',
};

describe('tools/spectral/ipa/rulesets/functions/utils/extensions.js', () => {
  describe('hasCustomMethodOverride', () => {
    it('returns true if the method has the extension with the customMethod boolean set to true', () => {
      expect(hasCustomMethodOverride(operationWithCustomMethodVerbOverride)).toBe(true);
    });
    it('returns false if the method does not have the extension', () => {
      expect(hasCustomMethodOverride({})).toBe(false);
    });
    it('returns false if the method has the extension but is not a custom method', () => {
      expect(hasCustomMethodOverride(operationWithVerbOverride)).toBe(false);
    });
  });

  describe('hasMethodVerbOverride', () => {
    it('returns true if the method has the extension with the expected verb', () => {
      expect(hasMethodVerbOverride(operationWithVerbOverride, 'get')).toBe(true);
    });
    it('returns false if the method does not have the extension', () => {
      expect(hasMethodVerbOverride({}, 'get')).toBe(false);
    });
    it('returns false if the method has the extension but with an unexpected verb', () => {
      expect(hasMethodVerbOverride(operationWithVerbOverride, 'put')).toBe(false);
    });
  });

  describe('hasOperationIdOverride', () => {
    it('returns true if the method has the extension', () => {
      expect(hasOperationIdOverride(operationWithOperationIdOverride)).toBe(true);
    });
    it('returns true if the method has the extension but with an empty value', () => {
      expect(hasOperationIdOverride(operationWithEmptyOperationIdOverride)).toBe(true);
    });
    it('returns false if the method does not have the extension', () => {
      expect(hasOperationIdOverride(operationWithNoOverrides)).toBe(false);
    });
  });

  describe('getOperationIdOverride', () => {
    it('returns the value if the method has the extension', () => {
      expect(getOperationIdOverride(operationWithOperationIdOverride)).toBe('customOperationId');
    });
    it('returns an empty value if the method has the extension with an empty value', () => {
      expect(getOperationIdOverride(operationWithEmptyOperationIdOverride)).toBe('');
    });
    it('returns undefined if the method does not have the extension', () => {
      expect(getOperationIdOverride(operationWithNoOverrides)).toBe(undefined);
    });
  });

  describe('hasVerbOverride', () => {
    it('returns true if the method has the extension', () => {
      expect(hasVerbOverride(operationWithVerbOverride)).toBe(true);
      expect(hasVerbOverride(operationWithCustomMethodVerbOverride)).toBe(true);
    });
    it('returns false if the method does not have the extension', () => {
      expect(hasVerbOverride(operationWithNoOverrides)).toBe(false);
    });
  });
});
