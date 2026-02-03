import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-109-operation-id-length', [
  {
    name: 'valid operation ID with 4 words or less',
    document: {
      paths: {
        '/groups/{groupId}/clusters/{clusterName}:pause': {
          post: {
            operationId: 'pauseGroupCluster',
          },
        },
        '/api/atlas/v2/groups/{groupId}/clusters:search': {
          post: {
            operationId: 'searchGroupClusters',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'operation ID longer than 4 words without override',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/snapshots:export': {
          post: {
            operationId: 'exportGroupClusterBackupSnapshots',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-operation-id-length',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. For example: 'exportClusterBackupSnapshots'.",
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/snapshots:export',
          'post',
          'operationId',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'operation ID longer than 4 words with valid override',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/snapshots:export': {
          post: {
            operationId: 'exportGroupClusterBackupSnapshots',
            'x-xgen-operation-id-override': 'exportClusterSnapshots',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'operation ID longer than 4 words with exception',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/snapshots:export': {
          post: {
            operationId: 'exportGroupClusterBackupSnapshots',
            'x-xgen-IPA-exception': {
              'xgen-IPA-109-operation-id-length': 'Legacy operation ID, used in existing client SDKs.',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'operation ID with verb override',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/streams:search': {
          post: {
            operationId: 'searchGroupStreams',
            'x-xgen-method-verb-override': {
              verb: 'searchWorkspaces',
              customMethod: true,
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'custom method with x-xgen-method-verb-override should be ignored',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}:testFailover': {
          post: {
            operationId: 'testGroupClusterFailover',
            'x-xgen-method-verb-override': {
              verb: 'testFailover',
              customMethod: true,
            },
          },
        },
      },
    },
    errors: [],
  },
]);
