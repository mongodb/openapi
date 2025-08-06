import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-108-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/clusters/{clusterName}': {
          delete: {
            operationId: 'deleteGroupCluster',
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
        '/api/atlas/v2/groups/{groupId}/apiKeys/{apiUserId}': {
          delete: {
            operationId: 'removeProjectApiKey',
          },
        },
        '/api/atlas/v2/groups/{groupId}': {
          delete: {
            operationId: 'deleteProject',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/apiKeys/{apiUserId}', 'delete', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}', 'delete', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods with too long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}': {
          delete: {
            operationId: 'deleteOneDataFederationInstanceQueryLimit',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}',
          'delete',
          'operationId',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. ",
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}',
          'delete',
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
          post: {
            operationId: 'deleteRollingIndex',
            'x-xgen-IPA-exception': {
              'xgen-IPA-108-valid-operation-id': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
