import { describe, expect, it } from '@jest/globals';
import {
  containsOperationsSegment,
  isExactEnumMatch,
  isOperationsCollectionPath,
  isOperationsPath,
  isSingleOperationPath,
  operationsSegmentIsLeaf,
  getMergedProperties,
  getPropertyPath,
} from '../../rulesets/functions/utils/longRunningOperations';

describe('tools/spectral/ipa/utils/longRunningOperations.js', () => {
  describe('isOperationsCollectionPath', () => {
    it('recognizes Operations resource collections', () => {
      expect(isOperationsCollectionPath('/api/atlas/v2/groups/{groupId}/clusters/operations')).toBe(true);
      expect(isOperationsCollectionPath('/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/operations')).toBe(true);
      expect(isOperationsCollectionPath('/api/atlas/v2/unauth/resourceName/operations')).toBe(true);
      expect(isOperationsCollectionPath('/api/atlas/v2/operations')).toBe(true);
    });

    it('rejects other paths', () => {
      expect(isOperationsCollectionPath('/api/atlas/v2/resourceName/operations/{operationId}')).toBe(false);
      expect(isOperationsCollectionPath('/api/atlas/v2/resourceName')).toBe(false);
      expect(isOperationsCollectionPath('/api/atlas/v2/resourceName/operations/subresource')).toBe(false);
    });
  });

  describe('isSingleOperationPath', () => {
    it('recognizes single Operations resources', () => {
      expect(isSingleOperationPath('/api/atlas/v2/groups/{groupId}/clusters/operations/{operationId}')).toBe(true);
      expect(
        isSingleOperationPath('/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/operations/{operationId}')
      ).toBe(true);
      expect(isSingleOperationPath('/api/atlas/v2/operations/{operationId}')).toBe(true);
    });

    it('rejects other paths', () => {
      expect(isSingleOperationPath('/api/atlas/v2/resourceName/operations')).toBe(false);
      expect(isSingleOperationPath('/api/atlas/v2/resourceName/{pathParam}')).toBe(false);
      expect(isSingleOperationPath('/api/atlas/v2/resourceName/operations/{operationId}/subresource')).toBe(false);
    });

    it('is lenient about the path parameter syntax, casing is covered by IPA-102', () => {
      expect(isSingleOperationPath('/api/atlas/v2/resourceName/operations/{OperationId}')).toBe(true);
    });
  });

  describe('isOperationsPath', () => {
    it('recognizes both Operations resource forms', () => {
      expect(isOperationsPath('/api/atlas/v2/resourceName/operations')).toBe(true);
      expect(isOperationsPath('/api/atlas/v2/resourceName/operations/{operationId}')).toBe(true);
    });

    it('ignores custom method paths', () => {
      expect(isOperationsPath('/api/atlas/v2/resourceName/operations:customMethod')).toBe(false);
      expect(isOperationsPath('/api/atlas/v2/resourceName/operations/{operationId}:cancel')).toBe(false);
      expect(containsOperationsSegment('/api/atlas/v2/resourceName/operations/{operationId}:cancel')).toBe(false);
    });

    it('rejects paths nested below an Operations resource', () => {
      expect(isOperationsPath('/api/atlas/v2/resourceName/operations/subresource')).toBe(false);
      expect(isOperationsPath('/api/atlas/v2/resourceName/operations/{operationId}/subresource')).toBe(false);
    });
  });

  describe('containsOperationsSegment', () => {
    it('finds operations segments at any position', () => {
      expect(containsOperationsSegment('/api/atlas/v2/resourceName/operations')).toBe(true);
      expect(containsOperationsSegment('/api/atlas/v2/resourceName/operations/{operationId}/subresource')).toBe(true);
      expect(containsOperationsSegment('/api/atlas/v2/operations/subresource')).toBe(true);
    });

    it('rejects paths without an operations segment', () => {
      expect(containsOperationsSegment('/api/atlas/v2/resourceName')).toBe(false);
      expect(containsOperationsSegment('/api/atlas/v2/resourceName/{operationId}')).toBe(false);
    });
  });

  describe('operationsSegmentIsLeaf', () => {
    it('accepts leaf Operations endpoints and paths without an operations segment', () => {
      expect(operationsSegmentIsLeaf('/api/atlas/v2/resourceName/operations')).toBe(true);
      expect(operationsSegmentIsLeaf('/api/atlas/v2/resourceName/operations/{operationId}')).toBe(true);
      expect(operationsSegmentIsLeaf('/api/atlas/v2/resourceName')).toBe(true);
    });

    it('rejects nesting below the first operations segment', () => {
      expect(operationsSegmentIsLeaf('/api/atlas/v2/resourceName/operations/subresource')).toBe(false);
      expect(operationsSegmentIsLeaf('/api/atlas/v2/resourceName/operations/{operationId}/subresource')).toBe(false);
      expect(operationsSegmentIsLeaf('/api/atlas/v2/resourceName/operations/{operationId}/operations')).toBe(false);
      expect(operationsSegmentIsLeaf('/api/atlas/v2/operations/subresource')).toBe(false);
    });
  });

  describe('isExactEnumMatch', () => {
    it('accepts exact matches in any order', () => {
      expect(isExactEnumMatch(['SUCCEEDED', 'PENDING', 'FAILED'], ['PENDING', 'SUCCEEDED', 'FAILED'])).toBe(true);
      expect(isExactEnumMatch(['CUSTOM', 'DELETE', 'UPDATE', 'CREATE'], ['CREATE', 'UPDATE', 'DELETE', 'CUSTOM'])).toBe(
        true
      );
    });

    it('rejects missing, extra, duplicate or undefined values', () => {
      expect(isExactEnumMatch(['PENDING', 'SUCCEEDED'], ['PENDING', 'SUCCEEDED', 'FAILED'])).toBe(false);
      expect(isExactEnumMatch(['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED'], ['PENDING', 'SUCCEEDED', 'FAILED'])).toBe(
        false
      );
      expect(isExactEnumMatch(['CREATE', 'CREATE', 'UPDATE'], ['CREATE', 'UPDATE', 'DELETE'])).toBe(false);
      expect(isExactEnumMatch(undefined, ['CREATE', 'UPDATE'])).toBe(false);
    });
  });

  describe('getMergedProperties', () => {
    it('combines keyword maps conjunctively instead of overwriting them', () => {
      const schema = {
        properties: {
          status: { type: 'string', enum: ['PENDING', 'SUCCEEDED', 'FAILED'] },
        },
        allOf: [{ properties: { status: { description: 'Lifecycle state.' } } }],
      };
      const merged = getMergedProperties(schema);
      expect(merged.status.enum).toEqual(['PENDING', 'SUCCEEDED', 'FAILED']);
      expect(merged.status.description).toBe('Lifecycle state.');
    });

    it('intersects enums declared by several allOf members', () => {
      const schema = {
        properties: {
          status: { enum: ['PENDING', 'DONE'] },
        },
        allOf: [{ properties: { status: { enum: ['PENDING', 'SUCCEEDED', 'FAILED'] } } }],
      };
      expect(getMergedProperties(schema).status.enum).toEqual(['PENDING']);
    });

    it('merges nested property maps recursively', () => {
      const schema = {
        allOf: [
          { properties: { error: { properties: { code: { type: 'string' } } } } },
          { properties: { error: { properties: { message: { type: 'string' } } } } },
        ],
      };
      const merged = getMergedProperties(schema);
      expect(Object.keys(merged.error.properties)).toEqual(['code', 'message']);
    });
  });

  describe('getPropertyPath', () => {
    it('locates properties defined directly and within allOf members', () => {
      const schema = {
        properties: { operationId: { type: 'string' } },
        allOf: [{ allOf: [{ properties: { createdAt: { type: 'string' } } }] }],
      };
      expect(getPropertyPath(schema, 'operationId')).toEqual(['properties', 'operationId']);
      expect(getPropertyPath(schema, 'createdAt')).toEqual(['allOf', 0, 'allOf', 0, 'properties', 'createdAt']);
      expect(getPropertyPath(schema, 'unknown')).toBeUndefined();
    });
  });
});
