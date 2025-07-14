import { describe, expect, it } from '@jest/globals';
import { generateOperationID } from '../../rulesets/functions/utils/operationIdGeneration';

describe('tools/spectral/ipa/utils/operationIdGeneration.js', () => {
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
      'exportGroupBackupBucket'
    );
  });

  it('should accommodate legacy custom methods', () => {
    expect(generateOperationID('', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/restartPrimaries')).toEqual(
      'restartGroupClusterPrimaries'
    );
  });
});
