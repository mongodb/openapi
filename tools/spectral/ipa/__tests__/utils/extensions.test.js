import { describe, it, expect } from '@jest/globals';
import {
  hasCustomMethodOverride,
  hasMethodVerbOverride,
  hasOperationIdOverride,
  getOperationIdOverride,
} from '../../rulesets/functions/utils/extensions';

const methodWithExtension = {
  'x-xgen-method-verb-override': {
    verb: 'get',
    customMethod: false,
  },
};

const customMethod = {
  'x-xgen-method-verb-override': {
    verb: 'add',
    customMethod: true,
  },
};

const endpointWithMethodExtension = {
  delete: {
    'x-xgen-method-verb-override': { verb: 'remove', customMethod: true },
  },
};

const endpointWithNoMethodExtension = {
  exception: true,
};

const operationWithOperationIdOverride = {
  operationId: 'operationId',
  'x-xgen-operation-id-override': 'customOperationId',
};

const operationWithEmptyOperationIdOverride = {
  operationId: 'operationId',
  'x-xgen-operation-id-override': '',
};

const operationWithNoOperationIdOverride = {
  operationId: 'operationId',
};

describe('tools/spectral/ipa/rulesets/functions/utils/extensions.js', () => {
  describe('hasCustomMethodOverride', () => {
    it('returns true if the method has the extension with the customMethod boolean set to true', () => {
      expect(hasCustomMethodOverride(customMethod)).toBe(true);
    });
    it('returns false if the method does not have the extension', () => {
      expect(hasCustomMethodOverride({})).toBe(false);
    });
    it('returns false if the method has the extension but is not a custom method', () => {
      expect(hasCustomMethodOverride(methodWithExtension)).toBe(false);
    });
  });

  describe('hasMethodVerbOverride', () => {
    it('returns true if the method has the extension with the expected verb', () => {
      expect(hasMethodVerbOverride(methodWithExtension, 'get')).toBe(true);
    });
    it('returns false if the method does not have the extension', () => {
      expect(hasMethodVerbOverride({}, 'get')).toBe(false);
    });
    it('returns false if the method has the extension but with an unexpected verb', () => {
      expect(hasMethodVerbOverride(methodWithExtension, 'put')).toBe(false);
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
      expect(hasOperationIdOverride(operationWithNoOperationIdOverride)).toBe(false);
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
      expect(getOperationIdOverride(operationWithNoOperationIdOverride)).toBe(undefined);
    });
  });
});
