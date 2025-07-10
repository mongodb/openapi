import testRule from './__helpers__/testRule';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294
// TOOD: enable tests for invalid methods (after rules are upgraded to warning) - CLOUDP-329722

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
  // This test will be enable when the xgen-IPA-109-valid-operation-id is set to warning severity - CLOUDP-329722
  /* {
    name: 'invalid methods',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters:search': {
          post: {
            operationId: 'searchClusters',
          },
        },
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
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/clusters:search'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-valid-operation-id',
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}:migrate'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  }, */
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
