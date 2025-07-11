import testRule from './__helpers__/testRule';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294
// TOOD: enable tests for invalid methods (after rules are upgraded to warning) - CLOUDP-329722

testRule('xgen-IPA-105-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/clusters': {
          get: {
            operationId: 'listGroupClusters',
          },
        },
      },
    },
    errors: [],
  },
  // This test will be enable when the xgen-IPA-105-valid-operation-id is set to warning severity - CLOUDP-329722
  /* {
    name: 'invalid methods',
    document: {
      paths: {
        '/api/atlas/v2/orgs/{orgId}/teams/{teamId}/users': {
          get: {
            operationId: 'listTeamUsers',
          },
        },
        '/api/atlas/v2/orgs/{orgId}/events': {
          get: {
            operationId: 'listOrganizationEvents',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-105-valid-operation-id',
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/databaseUsers/{username}/certs', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-valid-operation-id',
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/orgs/{orgId}/events', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  }, */
  {
    name: 'invalid methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/outageSimulation': {
          get: {
            operationId: 'getOutageSimulation',
            'x-xgen-IPA-exception': {
              'xgen-IPA-105-valid-operation-id': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
