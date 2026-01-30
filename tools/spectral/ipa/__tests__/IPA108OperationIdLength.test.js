import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-108-operation-id-length', [
  {
    name: 'valid operation ID with 4 words or less',
    document: {
      paths: {
        '/groups/{groupId}/clusters/{clusterName}': {
          delete: {
            operationId: 'deleteGroupCluster',
          },
        },
        '/api/atlas/v2/groups/{groupId}/backup/exports/{exportId}': {
          delete: {
            operationId: 'deleteGroupBackupExport',
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
        '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}': {
          delete: {
            operationId: 'deleteGroupDataFederationLimit',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-operation-id-length',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. For example: 'deleteDataFederationLimit'.",
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}',
          'delete',
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
        '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}': {
          delete: {
            operationId: 'deleteGroupDataFederationLimit',
            'x-xgen-operation-id-override': 'deleteDataFederationLimit',
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
        '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}': {
          delete: {
            operationId: 'deleteGroupDataFederationLimit',
            'x-xgen-IPA-exception': {
              'xgen-IPA-108-operation-id-length': 'Legacy operation ID, used in existing client SDKs.',
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
        '/api/atlas/v2/groups/{groupId}/streams/{tenantName}': {
          delete: {
            operationId: 'deleteGroupStream',
            'x-xgen-method-verb-override': {
              verb: 'deleteWorkspace',
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
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}:pause': {
          post: {
            operationId: 'pauseGroupCluster',
          },
        },
      },
    },
    errors: [],
  },
]);
