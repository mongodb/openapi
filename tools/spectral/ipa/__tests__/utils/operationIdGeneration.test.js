import { describe, expect, it } from '@jest/globals';
import {
  generateOperationID,
  numberOfWords,
  shortenOperationId,
} from '../../rulesets/functions/utils/operationIdGeneration';

describe('tools/spectral/ipa/utils/operationIdGeneration.js', () => {
  describe('generateOperationID', () => {
    it('should singularize all nouns', () => {
      expect(generateOperationID('create', '/groups/{groupId}/clusters')).toEqual('createGroupCluster');
      expect(generateOperationID('delete', '/groups/{groupId}/clusters/{clusterName}')).toEqual('deleteGroupCluster');
      expect(generateOperationID('get', '/groups/{groupId}/clusters/{clusterName}')).toEqual('getGroupCluster');
      expect(generateOperationID('update', '/groups/{groupId}/clusters/{clusterName}')).toEqual('updateGroupCluster');
      expect(generateOperationID('pause', '/groups/{groupId}/clusters/{clusterName}')).toEqual('pauseGroupCluster');
    });

    it('should leave the final noun as is', () => {
      expect(generateOperationID('list', '/groups/{groupId}/clusters')).toEqual('listGroupClusters');
      expect(generateOperationID('get', '/groups/{groupId}/settings')).toEqual('getGroupSettings');
      expect(generateOperationID('update', '/groups/{groupId}/settings')).toEqual('updateGroupSettings');
      expect(generateOperationID('search', '/groups/{groupId}/clusters')).toEqual('searchGroupClusters');
      expect(
        generateOperationID(
          'get',
          '/groups/{groupId}/clusters/{clusterName}/{clusterView}/{databaseName}/{collectionName}/collStats/measurements'
        )
      ).toEqual('getGroupClusterCollStatMeasurements');
      expect(generateOperationID('grant', '/api/atlas/v2/groups/{groupId}/access')).toEqual('grantGroupAccess');
    });

    it('should split camelCase method names', () => {
      expect(generateOperationID('addNode', '/groups/{groupId}/clusters/{clusterName}')).toEqual('addGroupClusterNode');
      expect(generateOperationID('get', '/api/atlas/v2/groups/byName/{groupName}')).toEqual('getGroupByName');
      expect(generateOperationID('', '/api/atlas/v2/groups/{groupId}/backup/exportBuckets/{exportBucketId}')).toEqual(
        'exportGroupBackupBuckets'
      );
    });

    it('should accommodate legacy custom methods', () => {
      expect(generateOperationID('', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/restartPrimaries')).toEqual(
        'restartGroupClusterPrimaries'
      );
      expect(generateOperationID('', '/api/atlas/v2/groups/{groupId}/pipelines/{pipelineName}/pause')).toEqual(
        'pauseGroupPipeline'
      );
    });

    it('should return method when path is empty', () => {
      expect(generateOperationID('get', '')).toEqual('get');
      expect(generateOperationID('getInfo', '')).toEqual('getInfo');
    });
  });

  describe('numberOfWords', () => {
    it('should count the number of words in a camelCase string', () => {
      expect(numberOfWords('create')).toEqual(1);
      expect(numberOfWords('createGroup')).toEqual(2);
      expect(numberOfWords('createGroupCluster')).toEqual(3);
      expect(numberOfWords('createGroupClusterIndex')).toEqual(4);
      expect(numberOfWords('')).toEqual(0);
    });
  });

  describe('shortenOperationId', () => {
    it('should shorten operation IDs correctly', () => {
      expect(shortenOperationId('createGroupClusterAutoScalingConfiguration')).toEqual(
        'createAutoScalingConfiguration'
      );
      expect(shortenOperationId('getFederationSettingConnectedOrgConfigRoleMapping')).toEqual('getConfigRoleMapping');
    });

    it('should make no change if the operation ID is <= 4 words long or undefined', () => {
      expect(shortenOperationId('createGroupClusterIndex')).toEqual('createGroupClusterIndex');
      expect(shortenOperationId('create')).toEqual('create');
      expect(shortenOperationId('')).toEqual('');
    });
  });
});
