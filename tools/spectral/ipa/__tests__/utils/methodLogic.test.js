import { describe, expect, it } from '@jest/globals';
import { isInvalidGetMethod, isInvalidListMethod } from '../../rulesets/functions/utils/methodLogic.js';

const standardResourcePathItems = {
  '/resource': {
    get: {},
    post: {},
  },
  '/resource/{id}': {
    get: {},
    patch: {},
    delete: {},
  },
};

const standardResourceWithCustomMethodPathItems = {
  standardResourcePathItems,
  '/resource/{id}:custom': {
    get: {},
  },
};

const singletonResourcePathItems = {
  '/resource/{id}/singleton': {
    get: {},
    patch: {},
  },
};
describe('tools/spectral/ipa/rulesets/functions/utils/methodLogic.js', () => {
  describe('isInvalidGetMethod', () => {
    const testCases = [
      {
        description: 'resource collection identifier for standard resource',
        resourcePaths: standardResourcePathItems,
        methodPath: '/resource',
        expectedIsInvalidGetMethod: true,
      },
      {
        description: 'custom method identifier for standard resource',
        methodPath: '/resource/{id}:custom',
        resourcePaths: standardResourceWithCustomMethodPathItems,
        expectedIsInvalidGetMethod: true,
      },
      {
        description: 'single resource identifier for standard resource',
        resourcePaths: standardResourcePathItems,
        methodPath: '/resource/{id}',
        expectedIsInvalidGetMethod: false,
      },
      {
        description: 'singleton resource identifier for singleton resource',
        methodPath: '/resource/{id}/singleton',
        resourcePaths: singletonResourcePathItems,
        expectedIsInvalidGetMethod: false,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.expectedIsInvalidGetMethod} for ${testCase.description}`, () => {
        expect(isInvalidGetMethod(testCase.methodPath, testCase.resourcePaths)).toEqual(
          testCase.expectedIsInvalidGetMethod
        );
      });
    });
  });

  describe('isInvalidListMethod', () => {
    const testCases = [
      {
        description: 'single resource identifier for standard resource',
        resourcePaths: standardResourcePathItems,
        methodPath: '/resource/{id}',
        expectedIsInvalidGetMethod: true,
      },
      {
        description: 'singleton resource identifier for singleton resource',
        methodPath: '/resource/{id}/singleton',
        resourcePaths: singletonResourcePathItems,
        expectedIsInvalidGetMethod: true,
      },
      {
        description: 'custom method identifier for standard resource',
        methodPath: '/resource/{id}:custom',
        resourcePaths: standardResourceWithCustomMethodPathItems,
        expectedIsInvalidGetMethod: true,
      },
      {
        description: 'resource collection identifier for standard resource',
        resourcePaths: standardResourcePathItems,
        methodPath: '/resource',
        expectedIsInvalidGetMethod: false,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.expectedIsInvalidGetMethod} for ${testCase.description}`, () => {
        expect(isInvalidListMethod(testCase.methodPath, testCase.resourcePaths)).toEqual(
          testCase.expectedIsInvalidGetMethod
        );
      });
    });
  });
});
