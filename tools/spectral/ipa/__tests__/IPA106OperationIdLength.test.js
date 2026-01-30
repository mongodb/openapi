import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-106-operation-id-length', [
  {
    name: 'valid operation ID with 4 words or less',
    document: {
      paths: {
        '/groups/{groupId}/clusters': {
          post: {
            operationId: 'createGroupCluster',
          },
        },
        '/api/atlas/v2/groups/{groupId}/backup/exports': {
          post: {
            operationId: 'createGroupBackupExport',
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
        '/api/atlas/v2/orgs/{orgId}/serviceAccounts/{clientId}/accessList': {
          post: {
            operationId: 'createOrgServiceAccountAccessList',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-operation-id-length',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. For example: 'createAccountAccessList'.",
        path: ['paths', '/api/atlas/v2/orgs/{orgId}/serviceAccounts/{clientId}/accessList', 'post', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'operation ID longer than 4 words with valid override',
    document: {
      paths: {
        '/api/atlas/v2/orgs/{orgId}/serviceAccounts/{clientId}/accessList': {
          post: {
            operationId: 'createOrgServiceAccountAccessList',
            'x-xgen-operation-id-override': 'createServiceAccountAccess',
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
        '/api/atlas/v2/orgs/{orgId}/serviceAccounts/{clientId}/accessList': {
          post: {
            operationId: 'createOrgServiceAccountAccessList',
            'x-xgen-IPA-exception': {
              'xgen-IPA-106-operation-id-length': 'Legacy operation ID, used in existing client SDKs.',
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
          post: {
            operationId: 'createGroupStream',
            'x-xgen-method-verb-override': {
              verb: 'createWorkspace',
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
