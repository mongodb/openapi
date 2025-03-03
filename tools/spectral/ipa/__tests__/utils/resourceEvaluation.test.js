import { describe, expect, it } from '@jest/globals';
import {
  getResourcePaths,
  isSingletonResource,
  isStandardResource,
} from '../../rulesets/functions/utils/resourceEvaluation';

const standardResourcePaths = ['/resource', '/resource/{exampleId}'];

const nestedStandardResourcePaths = ['/resource/{exampleId}/nested', '/resource/{exampleId}/nested/{exampleId}'];

const standardResourceWithCustomPaths = [
  '/customStandard',
  '/customStandard/{exampleId}',
  '/customStandard/{id}:method',
  '/customStandard:method',
];

const standardResourceMissingSubPath = ['/standardMissingSub'];

const standardResourceMissingSubPathInvalidFormat = ['/standard/nestedStandardMissingSub'];

const standardResourcePathsInvalidFormat = ['/resource1/resource2', '/resource1/resource2/{exampleId}'];

const singletonResourcePaths = ['/resource/{exampleId}/singleton'];

const singletonResourceWithCustomPaths = [
  '/resource/{exampleId}/customSingleton',
  '/resource/{exampleId}/customSingleton:method',
];

const allPaths = standardResourcePaths.concat(
  nestedStandardResourcePaths,
  standardResourceWithCustomPaths,
  standardResourceMissingSubPath,
  standardResourceMissingSubPathInvalidFormat,
  standardResourcePathsInvalidFormat,
  singletonResourcePaths,
  singletonResourceWithCustomPaths
);

describe('tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js', () => {
  describe('getResourcePaths', () => {
    const testCases = [
      {
        description: 'standard resource',
        resourceCollectionPath: '/resource',
        expectedPaths: standardResourcePaths,
      },
      {
        description: 'nested standard resource',
        resourceCollectionPath: '/resource/{exampleId}/nested',
        expectedPaths: nestedStandardResourcePaths,
      },
      {
        description: 'standard resource with custom methods',
        resourceCollectionPath: '/customStandard',
        expectedPaths: standardResourceWithCustomPaths,
      },
      {
        description: 'standard resource with missing sub-path',
        resourceCollectionPath: '/standardMissingSub',
        expectedPaths: standardResourceMissingSubPath,
      },
      {
        description: 'nested standard resource with missing sub-path',
        resourceCollectionPath: '/standard/nestedStandardMissingSub',
        expectedPaths: standardResourceMissingSubPathInvalidFormat,
      },
      {
        description: 'standard resource with missing sub-path',
        resourceCollectionPath: '/resource1/resource2',
        expectedPaths: standardResourcePathsInvalidFormat,
      },
      {
        description: 'singleton resource',
        resourceCollectionPath: '/resource/{exampleId}/singleton',
        expectedPaths: singletonResourcePaths,
      },
      {
        description: 'singleton resource with custom methods',
        resourceCollectionPath: '/resource/{exampleId}/customSingleton',
        expectedPaths: singletonResourceWithCustomPaths,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns the expected paths for ${testCase.description}`, () => {
        expect(getResourcePaths(testCase.resourceCollectionPath, allPaths)).toEqual(testCase.expectedPaths);
      });
    });
  });

  describe('isStandardResource', () => {
    const testCases = [
      {
        description: 'standard resource',
        resourcePaths: standardResourcePaths,
        isStandardResource: true,
      },
      {
        description: 'standard resource with custom methods',
        resourcePaths: standardResourceWithCustomPaths,
        isStandardResource: true,
      },
      {
        description: 'standard resource with missing sub-path',
        resourcePaths: standardResourceMissingSubPath,
        isStandardResource: true,
      },
      {
        description: 'nested standard resource with missing sub-path',
        resourcePaths: standardResourceMissingSubPathInvalidFormat,
        isStandardResource: true,
      },
      {
        description: 'nested standard resource',
        resourcePaths: nestedStandardResourcePaths,
        isStandardResource: true,
      },
      {
        description: 'singleton resource',
        resourcePaths: singletonResourcePaths,
        isStandardResource: false,
      },
      {
        description: 'singleton resource with custom methods',
        resourcePaths: singletonResourceWithCustomPaths,
        isStandardResource: false,
      },
      {
        description: 'invalid path format',
        resourcePaths: standardResourcePathsInvalidFormat,
        isStandardResource: true,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.isStandardResource} for ${testCase.description}`, () => {
        expect(isStandardResource(testCase.resourcePaths)).toEqual(testCase.isStandardResource);
      });
    });
  });

  describe('isSingletonResource', () => {
    const testCases = [
      {
        description: 'standard resource',
        resourcePaths: standardResourcePaths,
        isSingletonResource: false,
      },
      {
        description: 'standard resource with custom methods',
        resourcePaths: standardResourceWithCustomPaths,
        isSingletonResource: false,
      },
      {
        description: 'standard resource with missing sub-path',
        resourcePaths: standardResourceMissingSubPath,
        isSingletonResource: false,
      },
      {
        description: 'nested standard resource with missing sub-path',
        resourcePaths: standardResourceMissingSubPathInvalidFormat,
        isSingletonResource: false,
      },
      {
        description: 'invalid path format',
        resourcePaths: standardResourcePathsInvalidFormat,
        isSingletonResource: false,
      },
      {
        description: 'nested standard resource',
        resourcePaths: nestedStandardResourcePaths,
        isSingletonResource: false,
      },
      {
        description: 'singleton resource',
        resourcePaths: singletonResourcePaths,
        isSingletonResource: true,
      },
      {
        description: 'singleton resource with custom methods',
        resourcePaths: singletonResourceWithCustomPaths,
        isSingletonResource: true,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.isSingletonResource} for ${testCase.description}`, () => {
        expect(isSingletonResource(testCase.resourcePaths)).toEqual(testCase.isSingletonResource);
      });
    });
  });
});
