import {
  getSchemaPathFromEnumPath,
  schemaIsArray,
  schemaIsObject,
  schemaIsPaginated,
  splitCamelCase,
} from '../../rulesets/functions/utils/schemaUtils.js';
import { describe, expect, it } from '@jest/globals';

describe('tools/spectral/ipa/rulesets/functions/utils/schemaUtils.js', () => {
  describe('splitCamelCase', () => {
    it('should split basic camelCase strings', () => {
      expect(splitCamelCase('camelCase')).toEqual(['camel', 'case']);
      expect(splitCamelCase('thisIsCamelCase')).toEqual(['this', 'is', 'camel', 'case']);
    });

    it('should handle single-word strings', () => {
      expect(splitCamelCase('word')).toEqual(['word']);
      expect(splitCamelCase('Word')).toEqual(['word']);
    });

    it('should handle strings with numbers', () => {
      expect(splitCamelCase('user123Name')).toEqual(['user123', 'name']);
      expect(splitCamelCase('user123name')).toEqual(['user123name']);
    });

    it('should handle empty strings', () => {
      expect(splitCamelCase('')).toEqual(['']);
    });

    it('should handle edge cases from the project', () => {
      expect(splitCamelCase('project')).toEqual(['project']);
      expect(splitCamelCase('projectId')).toEqual(['project', 'id']);
      expect(splitCamelCase('myProjectDetails')).toEqual(['my', 'project', 'details']);
      expect(splitCamelCase('projection')).toEqual(['projection']);
    });
  });

  describe('schemaIsPaginated', () => {
    it('returns true for a schema with an array property named "results"', () => {
      expect(
        schemaIsPaginated({
          type: 'object',
          properties: {
            results: {
              type: 'array',
            },
          },
        })
      ).toEqual(true);
    });
    it('returns false for a schema with a non-array property named "results"', () => {
      expect(
        schemaIsPaginated({
          type: 'object',
          properties: {
            results: {
              type: 'string',
            },
          },
        })
      ).toEqual(false);
    });
    it('returns false for a schema with no property named "results"', () => {
      expect(
        schemaIsPaginated({
          type: 'object',
          properties: {
            list: {
              type: 'array',
            },
          },
        })
      ).toEqual(false);
    });
    it('returns false for a schema with no properties', () => {
      expect(
        schemaIsPaginated({
          type: 'string',
        })
      ).toEqual(false);
    });
  });

  describe('schemaIsArray', () => {
    it('returns true for a schema with type array', () => {
      expect(
        schemaIsArray({
          type: 'array',
        })
      ).toEqual(true);
    });
    it('returns false for a schema with a non-array type', () => {
      expect(
        schemaIsArray({
          type: 'object',
        })
      ).toEqual(false);
    });
    it('returns false for a schema with no type', () => {
      expect(schemaIsArray({})).toEqual(false);
    });
  });

  describe('schemaIsObject', () => {
    it('returns true for a schema with type object', () => {
      expect(
        schemaIsObject({
          type: 'object',
        })
      ).toEqual(true);
    });
    it('returns false for a schema with a non-object type', () => {
      expect(
        schemaIsObject({
          type: 'array',
        })
      ).toEqual(false);
    });
    it('returns false for a schema with no type', () => {
      expect(schemaIsObject({})).toEqual(false);
    });
  });

  describe('getSchemaPathFromEnumPath', () => {
    it('returns the expected path to the property in an enum schema', () => {
      expect(
        getSchemaPathFromEnumPath(['components', 'schemas', 'EnumSchema', 'properties', 'test', 'enum', 0])
      ).toEqual(['components', 'schemas', 'EnumSchema', 'properties', 'test']);
    });
    it('returns the expected path to the property in an enum array schema', () => {
      expect(
        getSchemaPathFromEnumPath(['components', 'schemas', 'EnumSchema', 'properties', 'test', 'items', 'enum', 0])
      ).toEqual(['components', 'schemas', 'EnumSchema', 'properties', 'test']);
    });
  });
});
