import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-107-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        'groups/{groupId}/clusters/{clusterName}': {
          put: {
            operationId: 'updateGroupCluster',
          },
        },
        '/groups/{groupId}/settings': {
          put: {
            operationId: 'updateGroupSettings',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods with short opIds',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/limits/{limitName}': {
          patch: {
            operationId: 'setProjectLimit',
          },
        },
        '/api/atlas/v2/groups/{groupId}/settings': {
          put: {
            operationId: 'updateProjectSettings',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/limits/{limitName}', 'patch', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/settings', 'put', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods with too long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/pushBasedLogExport': {
          patch: {
            operationId: 'updatePushBasedLogConfiguration',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/pushBasedLogExport', 'patch', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-valid-operation-id',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/pushBasedLogExport', 'patch', 'operationId'],
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
            operationId: 'updateRollingIndex',
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-valid-operation-id': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
