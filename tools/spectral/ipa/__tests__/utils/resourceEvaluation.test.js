import { describe, expect, it } from '@jest/globals';
import {
  getResourcePaths,
  isSingletonResource,
  isStandardResource,
} from '../../rulesets/functions/utils/resourceEvaluation';

const standardResourcePaths = ['/standard', '/standard/{id}'];

const nestedStandardResourcePaths = ['/standard/{exampleId}/nested', '/standard/{exampleId}/nested/{exampleId}'];

const standardResourceWithCustomPaths = ['/customStandard', '/customStandard/{id}', '/customStandard:method'];

const singletonResourcePaths = ['/singleton'];

const singletonResourceWithCustomPaths = ['/customSingleton', '/customSingleton:method'];

const nestedSingletonResourcePaths = ['/standard/{exampleId}/nestedSingleton'];

describe('tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js', () => {
  describe('getResourcePaths', () => {
    it('returns the paths for a resource based on parent path', () => {
      const allPaths = standardResourcePaths.concat(
        nestedStandardResourcePaths,
        standardResourceWithCustomPaths,
        singletonResourcePaths,
        singletonResourceWithCustomPaths,
        nestedSingletonResourcePaths
      );
      expect(getResourcePaths('/standard', allPaths)).toEqual(standardResourcePaths);
      expect(getResourcePaths('/standard/{exampleId}/nested', allPaths)).toEqual(nestedStandardResourcePaths);
      expect(getResourcePaths('/customStandard', allPaths)).toEqual(standardResourceWithCustomPaths);
      expect(getResourcePaths('/singleton', allPaths)).toEqual(singletonResourcePaths);
      expect(getResourcePaths('/customSingleton', allPaths)).toEqual(singletonResourceWithCustomPaths);
      expect(getResourcePaths('/standard/{exampleId}/nestedSingleton', allPaths)).toEqual(nestedSingletonResourcePaths);
    });
  });
  describe('isStandardResource', () => {
    it('returns true for a standard resource', () => {
      expect(isStandardResource(standardResourcePaths)).toBe(true);
    });

    it('returns true for a standard resource with custom methods', () => {
      expect(isStandardResource(standardResourceWithCustomPaths)).toBe(true);
    });

    it('returns true for a nested standard resource', () => {
      expect(isStandardResource(nestedStandardResourcePaths)).toBe(true);
    });

    it('returns false for a singleton resource', () => {
      expect(isStandardResource(singletonResourcePaths)).toBe(false);
    });

    it('returns false for a singleton resource with custom methods', () => {
      expect(isStandardResource(singletonResourceWithCustomPaths)).toBe(false);
    });

    it('returns false for a nested singleton resource', () => {
      expect(isStandardResource(nestedSingletonResourcePaths)).toBe(false);
    });
    it('testing that this test fails', () => {
      expect(isStandardResource(nestedSingletonResourcePaths)).toBe(true);
    });
  });
  describe('isSingletonResource', () => {
    it('returns true for a singleton resource', () => {
      expect(isSingletonResource(singletonResourcePaths)).toBe(true);
    });

    it('returns true for a singleton resource with custom methods', () => {
      expect(isSingletonResource(singletonResourceWithCustomPaths)).toBe(true);
    });

    it('returns true for a nested singleton resource', () => {
      expect(isSingletonResource(nestedSingletonResourcePaths)).toBe(true);
    });

    it('returns false for a standard resource', () => {
      expect(isSingletonResource(standardResourcePaths)).toBe(false);
    });

    it('returns false for a standard resource with custom methods', () => {
      expect(isSingletonResource(standardResourceWithCustomPaths)).toBe(false);
    });

    it('returns false for a nested standard resource', () => {
      expect(isSingletonResource(nestedStandardResourcePaths)).toBe(false);
    });
  });
});
