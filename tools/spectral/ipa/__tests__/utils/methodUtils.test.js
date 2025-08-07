import { describe, expect, it } from '@jest/globals';
import {
  getAllSuccessfulResponseSchemas,
  getResponseOfGetMethodByMediaType,
  getResponseOfListMethodByMediaType,
  getSchemaNameFromRef,
  getSchemaRef,
} from '../../rulesets/functions/utils/methodUtils.js';

describe('tools/spectral/ipa/rulesets/functions/utils/methodUtils.js', () => {
  describe('getAllSuccessfulResponseSchemas', () => {
    const operationObject = {
      responses: {
        200: {
          content: {
            'application/vnd.atlas.2023-01-01+json': {
              schema: {
                type: 'object',
              },
            },
            'application/vnd.atlas.2024-01-01+json': {
              schema: {
                type: 'array',
              },
            },
          },
          description: 'OK',
        },
        401: {
          content: {
            'application/json': {
              schema: {
                type: 'string',
              },
            },
          },
        },
      },
    };

    it('returns all 2xx response schemas', () => {
      const result = getAllSuccessfulResponseSchemas(operationObject);
      expect(result).toHaveLength(2);

      expect(result[0].schemaPath).toEqual(['responses', '200', 'content', 'application/vnd.atlas.2023-01-01+json']);
      expect(result[0].schema.type).toEqual('object');

      expect(result[1].schemaPath).toEqual(['responses', '200', 'content', 'application/vnd.atlas.2024-01-01+json']);
      expect(result[1].schema.type).toEqual('array');
    });
  });

  describe('getResponseOfGetMethodByMediaType', () => {
    const oas = {
      paths: {
        '/resource': {},
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      type: 'array',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const testCases = [
      {
        description: 'Exact version',
        requestedVersion: 'application/vnd.atlas.2023-01-01+json',
        expectedMatch: 'application/vnd.atlas.2023-01-01+json',
      },
      {
        description: 'Exact version',
        requestedVersion: 'application/vnd.atlas.2024-01-01+json',
        expectedMatch: 'application/vnd.atlas.2024-01-01+json',
      },
      {
        description: 'Latest past version',
        requestedVersion: 'application/vnd.atlas.2024-10-01+json',
        expectedMatch: 'application/vnd.atlas.2024-01-01+json',
      },
      {
        description: 'Latest past version',
        requestedVersion: 'application/vnd.atlas.2023-10-01+json',
        expectedMatch: 'application/vnd.atlas.2023-01-01+json',
      },
      {
        description: 'No match',
        requestedVersion: 'application/vnd.atlas.2020-10-01+json',
        expectedMatch: '',
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns the expected match for ${testCase.description}`, () => {
        const result = getResponseOfGetMethodByMediaType(testCase.requestedVersion, '/resource', oas);

        if (!testCase.expectedMatch) {
          expect(result).toBeNull();
        } else {
          expect(result).toEqual(oas.paths['/resource/{id}'].get.responses['200'].content[testCase.expectedMatch]);
        }
      });
    });
  });

  describe('getResponseOfListMethodByMediaType', () => {
    const oas = {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      type: 'array',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const testCases = [
      {
        description: 'Exact version',
        requestedVersion: 'application/vnd.atlas.2023-01-01+json',
        expectedMatch: 'application/vnd.atlas.2023-01-01+json',
      },
      {
        description: 'Exact version',
        requestedVersion: 'application/vnd.atlas.2024-01-01+json',
        expectedMatch: 'application/vnd.atlas.2024-01-01+json',
      },
      {
        description: 'Latest past version',
        requestedVersion: 'application/vnd.atlas.2024-10-01+json',
        expectedMatch: 'application/vnd.atlas.2024-01-01+json',
      },
      {
        description: 'Latest past version',
        requestedVersion: 'application/vnd.atlas.2023-10-01+json',
        expectedMatch: 'application/vnd.atlas.2023-01-01+json',
      },
      {
        description: 'No match',
        requestedVersion: 'application/vnd.atlas.2020-10-01+json',
        expectedMatch: '',
      },
    ];

    testCases.forEach((testCase) => {
      it(`returns the expected match for ${testCase.description}`, () => {
        const result = getResponseOfListMethodByMediaType(testCase.requestedVersion, '/resource', oas);

        if (!testCase.expectedMatch) {
          expect(result).toBeNull();
        } else {
          expect(result).toEqual(oas.paths['/resource'].get.responses['200'].content[testCase.expectedMatch]);
        }
      });
    });
  });

  describe('getSchemaRef', () => {
    it('returns the ref value for a schema with $ref', () => {
      expect(
        getSchemaRef({
          $ref: '#/components/schemas/ExampleSchema',
        })
      ).toEqual('#/components/schemas/ExampleSchema');
    });
    it('returns the ref value for a schema with items of $ref', () => {
      expect(
        getSchemaRef({
          type: 'array',
          items: {
            $ref: '#/components/schemas/ExampleItemsSchema',
          },
        })
      ).toEqual('#/components/schemas/ExampleItemsSchema');
    });
    it('returns undefined for a schema with no $ref', () => {
      expect(
        getSchemaRef({
          type: 'string',
        })
      ).toEqual(undefined);
    });
  });

  describe('getSchemaNameFromRef', () => {
    it('returns the schema name from a schema $ref', () => {
      expect(getSchemaNameFromRef('#/components/schemas/ExampleSchema')).toEqual('ExampleSchema');
    });
  });
});
