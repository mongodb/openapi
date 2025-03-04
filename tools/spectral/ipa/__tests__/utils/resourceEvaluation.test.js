import { describe, expect, it } from '@jest/globals';
import {
  getResourcePaths,
  isSingletonResource,
  isStandardResource,
} from '../../rulesets/functions/utils/resourceEvaluation';

// Standard resources
const standardResourcePaths = ['/resource', '/resource/{exampleId}'];

const nestedStandardResourcePaths = ['/resource/{exampleId}/nested', '/resource/{exampleId}/nested/{exampleId}'];

const standardResourceWithCustomPaths = [
  '/customStandard',
  '/customStandard/{exampleId}',
  '/customStandard/{id}:method',
  '/customStandard:method',
];

const standardResourceMissingSubPath = ['/standardMissingSub'];

// Singleton resources
const singletonResourcePaths = ['/resource/{exampleId}/singleton'];

const singletonResourceWithCustomPaths = [
  '/resource/{exampleId}/customSingleton',
  '/resource/{exampleId}/customSingleton:method',
];

// Neither standard nor singleton resources
const resourceMissingSubPathInvalidFormat = ['/standard/nestedStandardMissingSub'];

const resourcePathsInvalidFormat = ['/resourceOne/resourceTwo', '/resourceOne/resourceTwo/{exampleId}'];

const allPaths = standardResourcePaths.concat(
  nestedStandardResourcePaths,
  standardResourceWithCustomPaths,
  standardResourceMissingSubPath,
  singletonResourcePaths,
  singletonResourceWithCustomPaths,
  resourceMissingSubPathInvalidFormat,
  resourcePathsInvalidFormat
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
        expectedPaths: resourceMissingSubPathInvalidFormat,
      },
      {
        description: 'standard resource with missing sub-path',
        resourceCollectionPath: '/resourceOne/resourceTwo',
        expectedPaths: resourcePathsInvalidFormat,
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
        resourcePaths: resourceMissingSubPathInvalidFormat,
        isStandardResource: false,
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
        resourcePaths: resourcePathsInvalidFormat,
        isStandardResource: false,
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
        resourcePaths: resourceMissingSubPathInvalidFormat,
        isSingletonResource: false,
      },
      {
        description: 'invalid path format',
        resourcePaths: resourcePathsInvalidFormat,
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
