import { describe, expect, it } from '@jest/globals';
import {
  getResourcePathItems,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from '../../rulesets/functions/utils/resourceEvaluation';

const resource = {
  '/resource': {
    post: {},
    get: {},
  },
  '/resource/{id}': {
    get: {},
    patch: {},
    delete: {},
  },
};

const resourceMissingMethods = {
  '/resourceMissingMethods': {
    get: {},
  },
};

const childResourceMissingSubPath = {
  '/resource/{id}/childResourceMissingSubPath': {
    post: {},
    get: {},
  },
};

const childResource = {
  '/resource/{id}/child': {
    post: {},
    get: {},
  },
  '/resource/{id}/child/{id}': {
    get: {},
    patch: {},
    delete: {},
  },
};

const singleton = {
  '/resource/{id}/singleton': {
    get: {},
    patch: {},
  },
};

const customMethodResource = {
  '/custom': {
    post: {},
    get: {},
  },
  '/custom/{id}': {
    get: {},
    patch: {},
    delete: {},
  },
  '/custom/{id}:method': {
    post: {},
  },
  '/custom:method': {
    post: {},
  },
};

const mockOas = {
  paths: {
    ...resource,
    ...childResource,
    ...resourceMissingMethods,
    ...childResourceMissingSubPath,
    ...singleton,
    ...customMethodResource,
  },
};

describe('tools/spectral/ipa/rulesets/functions/utils/resourceEvaluation.js', () => {
  describe('isSingletonResource', () => {
    const testCases = [
      {
        description: 'standard resource',
        resourcePathItems: resource,
        isSingletonResource: false,
      },
      {
        description: 'nested standard resource',
        resourcePathItems: childResource,
        isSingletonResource: false,
      },
      {
        description: 'standard resource with missing methods',
        resourcePathItems: resourceMissingMethods,
        isSingletonResource: false,
      },
      {
        description: 'nested standard resource with missing sub-path',
        resourcePathItems: childResourceMissingSubPath,
        isSingletonResource: false,
      },
      {
        description: 'singleton resource',
        resourcePathItems: singleton,
        isSingletonResource: true,
      },
      {
        description: 'standard resource with custom methods',
        resourcePathItems: customMethodResource,
        isSingletonResource: false,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.isSingletonResource} for ${testCase.description}`, () => {
        expect(isSingletonResource(testCase.resourcePathItems)).toEqual(testCase.isSingletonResource);
      });
    });
  });

  describe('getResourcePathItems', () => {
    const testCases = [
      {
        description: 'standard resource',
        path: '/resource',
        expectedResourcePathItems: resource,
      },
      {
        description: 'standard child resource',
        path: '/resource/{id}/child',
        expectedResourcePathItems: childResource,
      },
      {
        description: 'singleton resource',
        path: '/resource/{id}/singleton',
        expectedResourcePathItems: singleton,
      },
      {
        description: 'resource with custom methods',
        path: '/custom',
        expectedResourcePathItems: customMethodResource,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns the expected path items for ${testCase.description}`, () => {
        const result = getResourcePathItems(testCase.path, mockOas.paths);
        const expectedResult = testCase.expectedResourcePathItems;

        expect(Object.keys(result)).toEqual(Object.keys(expectedResult));

        Object.keys(result).forEach((key) => {
          expect(Object.keys(result[key])).toEqual(Object.keys(expectedResult[key]));
        });
      });
    });
  });

  describe('isResourceCollectionIdentifier', () => {
    const testCases = [
      {
        description: 'collection identifier',
        path: '/resource',
        isResourceCollectionIdentifier: true,
      },
      {
        description: 'collection identifier child',
        path: '/resource/{id}/child',
        isResourceCollectionIdentifier: true,
      },
      {
        description: 'invalid parent collection identifier child',
        path: '/resourceOne/resourceTwo/{id}/child',
        isResourceCollectionIdentifier: true,
      },
      {
        description: 'invalid parent collection identifier child',
        path: '/resourceOne/{id}/{id}/child',
        isResourceCollectionIdentifier: true,
      },
      {
        description: 'single identifier',
        path: '/resource/{id}',
        isResourceCollectionIdentifier: false,
      },
      {
        description: 'single identifier child',
        path: '/resource/{id}/child/{id}',
        isResourceCollectionIdentifier: false,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.isResourceCollectionIdentifier} for ${testCase.description}`, () => {
        expect(isResourceCollectionIdentifier(testCase.path)).toEqual(testCase.isResourceCollectionIdentifier);
      });
    });
  });

  describe('isSingleResourceIdentifier', () => {
    const testCases = [
      {
        description: 'collection identifier',
        path: '/resource',
        isSingleResourceIdentifier: false,
      },
      {
        description: 'collection identifier child',
        path: '/resource/{id}/child',
        isSingleResourceIdentifier: false,
      },
      {
        description: 'invalid parent collection identifier child',
        path: '/resourceOne/resourceTwo/{id}/child',
        isSingleResourceIdentifier: false,
      },
      {
        description: 'invalid parent collection identifier child',
        path: '/resourceOne/{id}/{id}/child',
        isSingleResourceIdentifier: false,
      },
      {
        description: 'invalid single identifier child',
        path: '/resourceOne/{id}/{id}',
        isSingleResourceIdentifier: false,
      },
      {
        description: 'invalid single identifier',
        path: '/resource/resource/{id}',
        isSingleResourceIdentifier: false,
      },
      {
        description: 'single identifier',
        path: '/resource/{id}',
        isSingleResourceIdentifier: true,
      },
      {
        description: 'single identifier child',
        path: '/resource/{id}/child/{id}',
        isSingleResourceIdentifier: true,
      }
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.isSingleResourceIdentifier} for ${testCase.description}`, () => {
        expect(isSingleResourceIdentifier(testCase.path)).toEqual(testCase.isSingleResourceIdentifier);
      });
    });
  });
});
