import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-109-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/clusters/{clusterName}:pause': {
          post: {
            operationId: 'pauseGroupCluster',
          },
        },
        '/groups/{groupId}/clusters/{clusterName}:addNode': {
          post: {
            operationId: 'addGroupClusterNode',
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
        '/api/atlas/v2/groups/{groupId}/clusters:search': {
          post: {
            operationId: 'searchClusters',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/clusters:search', 'post', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods with too long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}:migrate': {
          post: {
            operationId: 'migrateProjectToAnotherOrg',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}:migrate', 'post', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-valid-operation-id',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}:migrate', 'post', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/orgs/{orgId}/users/{userId}:addRole': {
          post: {
            operationId: 'addOrgRole',
            'x-xgen-IPA-exception': {
              'xgen-IPA-109-valid-operation-id': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
