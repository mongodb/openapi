import { describe, expect, it } from '@jest/globals';
import {
  allPropertiesAreReadOnly,
  getResourcePathItems,
  isReadOnlyResource,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
  isSingletonResource,
} from '../../rulesets/functions/utils/resourceEvaluation';

const resource = {
  '/resource': {
    post: {},
    get: {
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', readOnly: true },
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                }
              },
            },
          },
        },
      },
    },
  },
  '/resource/{id}': {
    get: {
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string', readOnly: true },
                  name: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
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
    get: {
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string', readOnly: true },
                  name: { type: 'string' },
                  enabled: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    patch: {},
  },
};

const readOnlySingleton = {
  '/resource/{id}/readOnlySingleton': {
    get: {
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', readOnly: true },
                  createdAt: { type: 'string', readOnly: true },
                  updatedAt: { type: 'string', readOnly: true },
                },
              },
            },
          },
        },
      },
    },
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

const readOnlyResource = {
  '/readOnlyResource': {
    get: {
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string', readOnly: true },
                  name: { type: 'string', readOnly: true },
                  createdAt: { type: 'string', readOnly: true },
                },
              },
            },
          },
        },
      },
    },
  },
  '/readOnlyResource/{id}': {
    get: {
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string', readOnly: true },
                  name: { type: 'string', readOnly: true },
                  createdAt: { type: 'string', readOnly: true },
                },
              },
            },
          },
        },
      },
    },
  },
};


const resourceWithoutGetMethod = {
  '/resourceWithoutGet': {
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
    ...readOnlySingleton,
    ...customMethodResource,
    ...readOnlyResource,
    ...resourceWithoutGetMethod,
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
        description: 'read-only singleton resource',
        resourcePathItems: readOnlySingleton,
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
        description: 'read-only singleton resource',
        path: '/resource/{id}/readOnlySingleton',
        expectedResourcePathItems: readOnlySingleton,
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
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.isSingleResourceIdentifier} for ${testCase.description}`, () => {
        expect(isSingleResourceIdentifier(testCase.path)).toEqual(testCase.isSingleResourceIdentifier);
      });
    });
  });

  describe('allPropertiesAreReadOnly', () => {
    const testCases = [
      {
        description: 'schema with all properties readOnly',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', readOnly: true },
            name: { type: 'string', readOnly: true },
            createdAt: { type: 'string', readOnly: true },
          },
        },
        expected: true,
      },
      {
        description: 'schema with some properties not readOnly',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', readOnly: true },
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        expected: false,
      },
      {
        description: 'schema with no properties',
        schema: {
          type: 'object',
        },
        expected: false,
      },
      {
        description: 'schema with nested object all readOnly',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', readOnly: true },
            metadata: {
              type: 'object',
              readOnly: true,
              properties: {
                createdBy: { type: 'string', readOnly: true },
                updatedBy: { type: 'string', readOnly: true },
              },
            },
          },
        },
        expected: true,
      },
      {
        description: 'schema with array items all readOnly',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', readOnly: true },
              name: { type: 'string', readOnly: true },
            },
          },
        },
        expected: true,
      },
      {
        description: 'schema with allOf all readOnly',
        schema: {
          allOf: [
            {
              type: 'object',
              properties: {
                id: { type: 'string', readOnly: true },
              },
            },
            {
              type: 'object',
              properties: {
                name: { type: 'string', readOnly: true },
              },
            },
          ],
        },
        expected: true,
      },
      {
        description: 'null schema',
        schema: null,
        expected: false,
      },
      {
        description: 'undefined schema',
        schema: undefined,
        expected: false,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.expected} for ${testCase.description}`, () => {
        expect(allPropertiesAreReadOnly(testCase.schema)).toEqual(testCase.expected);
      });
    });
  });

  describe('isReadOnlyResource', () => {
    const testCases = [
      {
        description: 'read-only resource',
        resourcePathItems: readOnlyResource,
        expected: true,
      },
      {
        description: 'resource without GET method',
        resourcePathItems: resourceWithoutGetMethod,
        expected: false,
      },
      {
        description: 'standard resource with mixed readOnly properties',
        resourcePathItems: resource,
        expected: false,
      },
      {
        description: 'singleton resource (writable)',
        resourcePathItems: singleton,
        expected: false,
      },
      {
        description: 'read-only singleton resource',
        resourcePathItems: readOnlySingleton,
        expected: true,
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns ${testCase.expected} for ${testCase.description}`, () => {
        expect(isReadOnlyResource(testCase.resourcePathItems)).toEqual(testCase.expected);
      });
    });
  });
});
