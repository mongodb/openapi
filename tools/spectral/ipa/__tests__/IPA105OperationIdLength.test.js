import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-105-operation-id-length', [
  {
    name: 'valid operation ID with 4 words or less',
    document: {
      paths: {
        '/groups/{groupId}/clusters': {
          get: {
            operationId: 'listGroupClusters',
          },
        },
        '/api/atlas/v2/groups/{groupId}/backup/exports': {
          get: {
            operationId: 'listGroupBackupExports',
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
        '/api/atlas/v2/groups/{groupId}/backup/snapshot/export/jobs': {
          get: {
            operationId: 'listGroupBackupSnapshotExportJobs',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-105-operation-id-length',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. For example: 'listSnapshotExportJobs'.",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/backup/snapshot/export/jobs', 'get', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'operation ID longer than 4 words with valid override',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/backup/snapshot/export/jobs': {
          get: {
            operationId: 'listGroupBackupSnapshotExportJobs',
            'x-xgen-operation-id-override': 'listSnapshotExportJobs',
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
        '/api/atlas/v2/groups/{groupId}/backup/snapshot/export/jobs': {
          get: {
            operationId: 'listGroupBackupSnapshotExportJobs',
            'x-xgen-IPA-exception': {
              'xgen-IPA-105-operation-id-length': 'Legacy operation ID, used in existing client SDKs.',
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
        '/api/atlas/v2/groups/{groupId}/streams': {
          get: {
            operationId: 'listGroupStreams',
            'x-xgen-method-verb-override': {
              verb: 'listWorkspaces',
              customMethod: false,
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'custom method should be ignored',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters:search': {
          post: {
            operationId: 'searchGroupClusters',
          },
        },
      },
    },
    errors: [],
  },
]);
