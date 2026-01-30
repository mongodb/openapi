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
        message: "Invalid OperationID. Found 'setProjectLimit', expected 'updateGroupLimit'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/limits/{limitName}', 'patch', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-107-valid-operation-id',
        message: "Invalid OperationID. Found 'updateProjectSettings', expected 'updateGroupSettings'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/settings', 'put', 'operationId'],
        severity: DiagnosticSeverity.Error,
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
        message:
          "Invalid OperationID. Found 'updatePushBasedLogConfiguration', expected 'updateGroupPushBasedLogExport'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/pushBasedLogExport', 'patch', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid methods with valid overrides',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/schedule': {
          patch: {
            operationId: 'updateGroupClusterBackupSchedule',
            'x-xgen-operation-id-override': 'updateBackupSchedule',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid methods with invalid overrides',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/schedule': {
          patch: {
            operationId: 'updateGroupClusterBackupSchedule',
            'x-xgen-operation-id-override': 'updateScheduleBackupMissing',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-valid-operation-id',
        message:
          "The operation ID override must only contain nouns from the operation ID 'updateGroupClusterBackupSchedule'. ",
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/schedule',
          'patch',
          'x-xgen-operation-id-override',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-107-valid-operation-id',
        message: "The operation ID override must end with the noun 'Schedule'. ",
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/backup/schedule',
          'patch',
          'x-xgen-operation-id-override',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid method with verb overrides',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/serverless': {
          patch: {
            operationId: 'updateGroupServerlessInstance',
            'x-xgen-method-verb-override': {
              verb: 'updateInstance',
              customMethod: false,
            },
            'x-xgen-operation-id-override': 'updateServerlessInstance',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/index ': {
          put: {
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
  {
    name: 'valid method that needs ignoreList',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes/{indexId}': {
          put: {
            operationId: 'updateGroupClusterFtsIndex',
            'x-xgen-operation-id-override': 'updateClusterFtsIndex',
          },
        },
      },
    },
    errors: [],
  },
]);
