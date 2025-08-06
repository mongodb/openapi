import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/cluster/{clusterName}': {
          get: {
            operationId: 'getGroupCluster',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods with short opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/accessList/{entryValue}': {
          get: {
            operationId: 'getProjectIpList',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/accessList/{entryValue}', 'get', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods with long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/queryShapeInsights/{queryShapeHash}/details': {
          get: {
            operationId: 'getShardedClusterBackup',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/queryShapeInsights/{queryShapeHash}/details',
          'get',
          'operationId',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/index ': {
          get: {
            operationId: 'getRollingIndex',
            'x-xgen-IPA-exception': {
              'xgen-IPA-104-valid-operation-id': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
