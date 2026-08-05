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

    it('should preserve the resource scope of operations paths', () => {
      // the collection-scoped paths keep the parent plural, the instance-scoped paths keep it singular,
      // so that the two Operations resources do not share an operation ID
      expect(generateOperationID('list', '/api/atlas/v2/groups/{groupId}/clusters/operations')).toEqual(
        'listGroupClustersOperations'
      );
      expect(generateOperationID('list', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/operations')).toEqual(
        'listGroupClusterOperations'
      );
      expect(generateOperationID('get', '/api/atlas/v2/groups/{groupId}/clusters/operations/{operationId}')).toEqual(
        'getGroupClustersOperation'
      );
      expect(
        generateOperationID('get', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/operations/{operationId}')
      ).toEqual('getGroupClusterOperation');
    });

    it('should preserve the resource scope for mutating methods on operations paths', () => {
      // IPA-132 Operations resources are read-only, so these methods should not exist. Pinned to
      // ensure the scope distinction stays consistent across every method, not just Get and List.
      expect(generateOperationID('create', '/api/atlas/v2/groups/{groupId}/clusters/operations')).toEqual(
        'createGroupClustersOperation'
      );
      expect(generateOperationID('create', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/operations')).toEqual(
        'createGroupClusterOperation'
      );
      expect(generateOperationID('update', '/api/atlas/v2/groups/{groupId}/clusters/operations/{operationId}')).toEqual(
        'updateGroupClustersOperation'
      );
      expect(
        generateOperationID('update', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/operations/{operationId}')
      ).toEqual('updateGroupClusterOperation');
      expect(generateOperationID('delete', '/api/atlas/v2/groups/{groupId}/clusters/operations/{operationId}')).toEqual(
        'deleteGroupClustersOperation'
      );
      expect(
        generateOperationID('delete', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/operations/{operationId}')
      ).toEqual('deleteGroupClusterOperation');
    });

    it('should not preserve the parent plural for other operations paths', () => {
      // {groupId} makes the parent instance-scoped (a single group), so the existing singularization applies
      expect(generateOperationID('list', '/api/atlas/v2/groups/{groupId}/operations')).toEqual('listGroupOperations');
      // the parent resource collection itself (no ID param), so it is treated as collection-scoped
      expect(generateOperationID('list', '/api/atlas/v2/groups/operations')).toEqual('listGroupsOperations');
      // 'operations' is not the trailing resource section
      expect(generateOperationID('list', '/api/atlas/v2/groups/{groupId}/clusters/operations/logs')).toEqual(
        'listGroupClusterOperationLogs'
      );
      // no parent resource to scope to
      expect(generateOperationID('list', '/api/atlas/v2/operations')).toEqual('listOperations');
      // multi-word custom methods append their own trailing noun, so the parent is singularized as before
      expect(generateOperationID('listPending', '/api/atlas/v2/groups/{groupId}/clusters/operations')).toEqual(
        'listGroupClusterOperationPending'
      );
    });

    it('should not affect operation IDs for non-operations paths', () => {
      // nested resource collection
      expect(generateOperationID('list', '/api/atlas/v2/groups/{groupId}/clusters')).toEqual('listGroupClusters');
      // single resource
      expect(generateOperationID('get', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}')).toEqual(
        'getGroupCluster'
      );
      // multi-word custom method
      expect(generateOperationID('addNode', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}')).toEqual(
        'addGroupClusterNode'
      );
      // legacy custom method
      expect(generateOperationID('', '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/restartPrimaries')).toEqual(
        'restartGroupClusterPrimaries'
      );
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

    it('should transform uppercase abbreviations and numbers to camel case correctly', () => {
      expect(generateOperationID('get', '/api/atlas/v2/groups/{groupId}/openAPI')).toEqual('getGroupOpenApi');
      expect(generateOperationID('list', '/api/atlas/v2/unauth/controlPlaneIPAddresses')).toEqual(
        'listControlPlaneIpAddresses'
      );
      expect(generateOperationID('delete', '/api/atlas/v2/groups/{groupId}/userSecurity/ldap/userToDNMapping')).toEqual(
        'deleteGroupUserSecurityLdapUserToDnMapping'
      );
      expect(generateOperationID('get', '/api/atlas/v2/groups/{groupId}/userSecurity/customerX509')).toEqual(
        'getGroupUserSecurityCustomerX509'
      );
    });
  });

  describe('numberOfWords', () => {
    it('should count the number of words in a camelCase string', () => {
      expect(numberOfWords('create')).toEqual(1);
      expect(numberOfWords('createGroup')).toEqual(2);
      expect(numberOfWords('createGroupCluster')).toEqual(3);
      expect(numberOfWords('createGroupClusterIndex')).toEqual(4);
      expect(numberOfWords('getOpenAPIInfo')).toEqual(4);
      expect(numberOfWords('getCustomDNS')).toEqual(3);
      expect(numberOfWords('getX509Certificate')).toEqual(3);
      expect(numberOfWords('X509Certificate')).toEqual(2);
      expect(numberOfWords('')).toEqual(0);
    });
  });

  describe('shortenOperationId', () => {
    it('should shorten operation IDs correctly', () => {
      expect(shortenOperationId('createGroupClusterAutoScalingConfiguration')).toEqual(
        'createAutoScalingConfiguration'
      );
      expect(shortenOperationId('getFederationSettingConnectedOrgConfigRoleMapping')).toEqual('getConfigRoleMapping');
      expect(shortenOperationId('getGroupAwsCustomDNS')).toEqual('getAwsCustomDNS');
      expect(shortenOperationId('getExampleOpenAPIInfo')).toEqual('getOpenAPIInfo');
      expect(shortenOperationId('getGroupUserX509Certificate')).toEqual('getUserX509Certificate');
    });

    it('should make no change if the operation ID is <= 4 words long or undefined', () => {
      expect(shortenOperationId('createGroupClusterIndex')).toEqual('createGroupClusterIndex');
      expect(shortenOperationId('create')).toEqual('create');
      expect(shortenOperationId('')).toEqual('');
    });
  });
});
