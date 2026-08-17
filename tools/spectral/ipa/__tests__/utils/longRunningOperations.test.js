import { describe, expect, it } from '@jest/globals';
import {
  containsOperationsSegment,
  isCompliantLongRunningOperation,
  isExactEnumMatch,
  isOperationsCollectionPath,
  isOperationsPath,
  isSingleOperationPath,
  LEGACY_LRO_OPERATION_IDS,
  operationsSegmentIsLeaf,
  usesComposition,
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

  describe('usesComposition', () => {
    it('detects allOf, oneOf and anyOf composition', () => {
      expect(usesComposition({ allOf: [{ type: 'object' }] })).toBe(true);
      expect(usesComposition({ oneOf: [{ type: 'object' }] })).toBe(true);
      expect(usesComposition({ anyOf: [{ type: 'object' }] })).toBe(true);
      expect(usesComposition({ type: 'object', properties: { id: { type: 'string' } } })).toBe(false);
    });
  });

  describe('isCompliantLongRunningOperation', () => {
    it('selects operations declaring a 202 response, with or without the extension', () => {
      expect(isCompliantLongRunningOperation({ operationId: 'createGroupThing', responses: { 202: {} } })).toBe(true);
      expect(
        isCompliantLongRunningOperation({
          operationId: 'createGroupThing',
          responses: { 202: {} },
          'x-xgen-long-running-operation': { legacy: false },
        })
      ).toBe(true);
    });

    it('ignores operations without a 202 response, even when the extension is present', () => {
      expect(isCompliantLongRunningOperation({ operationId: 'createGroupThing', responses: { 201: {} } })).toBe(false);
      expect(
        isCompliantLongRunningOperation({
          operationId: 'createGroupThing',
          responses: { 201: {} },
          'x-xgen-long-running-operation': { legacy: false },
        })
      ).toBe(false);
      expect(isCompliantLongRunningOperation({ operationId: 'createGroupThing' })).toBe(false);
    });

    it('excludes operations marked legacy by the merge step', () => {
      expect(
        isCompliantLongRunningOperation({
          operationId: 'createGroupThing',
          responses: { 202: {} },
          'x-xgen-long-running-operation': { legacy: true },
        })
      ).toBe(false);
    });

    it('excludes operations matched by the shared legacy operationId list', () => {
      expect(isCompliantLongRunningOperation({ operationId: 'deleteGroupCluster', responses: { 202: {} } })).toBe(
        false
      );
    });
  });

  describe('LEGACY_LRO_OPERATION_IDS', () => {
    it('is loaded from the shared legacy operation list', () => {
      expect(LEGACY_LRO_OPERATION_IDS.size).toBeGreaterThan(0);
      expect(LEGACY_LRO_OPERATION_IDS.has('deleteGroupCluster')).toBe(true);
    });
  });
});
