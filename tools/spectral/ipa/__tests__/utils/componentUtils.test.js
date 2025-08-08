import { describe, expect, it } from '@jest/globals';
import {
  isPathParam,
  pathIsForRequestVersion,
  pathIsForResponseVersion,
  resolveObject,
} from '../../rulesets/functions/utils/componentUtils.js';

describe('tools/spectral/ipa/rulesets/functions/utils/componentUtils.js', () => {
  describe('isPathParam', () => {
    it('returns true if the string is a path param', () => {
      expect(isPathParam('{id}')).toEqual(true);
    });
    it('returns true if the string is a path param with a custom method', () => {
      expect(isPathParam('{id}:custom')).toEqual(true);
    });
    it('returns false if the string is not a path param', () => {
      expect(isPathParam('resource')).toEqual(false);
      expect(isPathParam('resource:custom')).toEqual(false);
    });
  });

  describe('resolveObject', () => {
    const testOas = {
      paths: {
        '/resource': {
          get: {
            description: 'get resource',
          },
        },
      },
      components: {
        schemas: {
          MySchema: {
            properties: {
              fieldName: { type: 'string' },
            },
          },
        },
      },
    };

    it('resolves the OAS component based on the path', () => {
      expect(resolveObject(testOas, ['components', 'schemas', 'MySchema'])).toEqual(
        testOas.components.schemas.MySchema
      );
      expect(resolveObject(testOas, ['components', 'schemas', 'MySchema', 'properties', 'fieldName'])).toEqual(
        testOas.components.schemas.MySchema.properties.fieldName
      );
      expect(resolveObject(testOas, ['paths', '/resource', 'get'])).toEqual(testOas.paths['/resource'].get);
    });
    it('returns undefined if the OAS does not contain the component based on the path', () => {
      expect(resolveObject(testOas, ['components', 'schemas', 'MySchema2'])).toEqual(undefined);
      expect(resolveObject(testOas, ['components', 'schemas', 'MySchema', 'properties', 'fieldName2'])).toEqual(
        undefined
      );
      expect(resolveObject(testOas, ['paths', '/resource/{id}', 'get'])).toEqual(undefined);
    });
  });

  describe('pathIsForResponseVersion', () => {
    it('returns true for a path for a response version', () => {
      expect(
        pathIsForResponseVersion([
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-08-05+json',
        ])
      ).toEqual(true);
    });
    it('returns true for a path for a schema in a response version', () => {
      expect(
        pathIsForResponseVersion([
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-08-05+json',
          'schema',
        ])
      ).toEqual(true);
    });
    it('returns false for a path for a schema in a request version', () => {
      expect(
        pathIsForResponseVersion([
          'paths',
          '/resource/{id}',
          'get',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-08-05+json',
        ])
      ).toEqual(false);
    });
    it('returns false for a path for a schema in components', () => {
      expect(pathIsForResponseVersion(['components', 'schemas', 'ExampleSchema'])).toEqual(false);
    });
  });

  describe('pathIsForRequestVersion', () => {
    it('returns true for a request version', () => {
      expect(
        pathIsForRequestVersion([
          'paths',
          '/resource/{id}',
          'get',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-08-05+json',
        ])
      ).toEqual(true);
    });
    it('returns true for a path for a schema in a request version', () => {
      expect(
        pathIsForRequestVersion([
          'paths',
          '/resource/{id}',
          'get',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-08-05+json',
          'schema',
        ])
      ).toEqual(true);
    });
    it('returns false for a path for a response version', () => {
      expect(
        pathIsForRequestVersion([
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-08-05+json',
        ])
      ).toEqual(false);
    });
    it('returns false for a path for a schema in components', () => {
      expect(pathIsForRequestVersion(['components', 'schemas', 'ExampleSchema'])).toEqual(false);
    });
  });
});
