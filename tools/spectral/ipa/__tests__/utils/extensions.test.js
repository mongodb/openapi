import { describe, it, expect, toBe } from '@jest/globals';
import { hasMethodWithVerbOverride, hasCustomMethodOverride, hasMethodVerbOverride } from '../../rulesets/functions/utils/extensions';

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
}

const endpointWithMethodExtension = {
  delete: {
    'x-xgen-method-verb-override': { verb: '‘remove’', customMethod: true }
  }
};

const endpointWithNoMethodExtension = {
    'exception' : true
};

describe('tools/spectral/ipa/rulesets/functions/utils/extensions.js', () => {
  describe('hasMethodWithVerbOverride', () => {
    it('returns true if endpoint has method with the extension', () => {
      expect(hasMethodWithVerbOverride(endpointWithMethodExtension)).toBe(true);
    });
    it('returns false if object does not a method with the extension', () => {
      expect(hasMethodWithVerbOverride(endpointWithNoMethodExtension)).toBe(false);
    });
  });
});

describe('tools/spectral/ipa/rulesets/functions/utils/extensions.js', () => {
  describe('hasCustomMethodOverride', () => {
    it('returns true if the method has the extension with the cusotmMethod boolean set to true', () => {
      expect(hasCustomMethodOverride(customMethod)).toBe(true);
    });
    it('returns false if the method does not have the extension', () => {
      expect(hasCustomMethodOverride({})).toBe(false);
    });
    it('returns false if the method has the extension but is not a custom method', () => {
      expect(hasCustomMethodOverride(methodWithExtension)).toBe(false);
    });
  });
});

describe('tools/spectral/ipa/rulesets/functions/utils/extensions.js', () => {
  describe('hasMethodVerbOverride', () => {
    it('returns true if the method has the extension with the expected verb', () => {
      expect(hasMethodVerbOverride(methodWithExtension, "get")).toBe(true);
    });
    it('returns false if the method does not have the extension', () => {
      expect(hasMethodVerbOverride({}, "get")).toBe(false);
    });
    it('returns false if the method has the extension but with an unexpected verb', () => {
      expect(hasMethodVerbOverride(methodWithExtension, "put")).toBe(false);
    });
  });
});
