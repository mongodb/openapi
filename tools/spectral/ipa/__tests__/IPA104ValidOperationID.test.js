import testRule from './__helpers__/testRule';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294
// TOOD: enable tests for invalid methods (after rules are upgraded to warning) - CLOUDP-329722

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
  // This test will be enable when the xgen-IPA-104-valid-operation-id is set to warning severity - CLOUDP-329722
  /* {
    name: 'invalid methods',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/accessList/{entryValue}/status': {
          get: {
            operationId: 'getProjectIpAccessListStatus',
          },
        },
        '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}': {
          get: {
            operationId: 'returnFederatedDatabaseQueryLimit',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-valid-operation-id',
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/accessList/{entryValue}/status', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-valid-operation-id',
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/dataFederation/{tenantName}/limits/{limitName}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  }, */
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
