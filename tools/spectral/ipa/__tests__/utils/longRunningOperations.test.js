import { describe, expect, it } from '@jest/globals';
import {
  containsOperationsSegment,
  isOperationsCollectionPath,
  isOperationsPath,
  isSingleOperationPath,
  operationsSegmentIsLeaf,
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

    it('ignores custom method paths, which are covered by a dedicated rule', () => {
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
});
