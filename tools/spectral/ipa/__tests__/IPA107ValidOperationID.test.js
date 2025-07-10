import testRule from './__helpers__/testRule';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294
// TOOD: enable tests for invalid methods (after rules are upgraded to warning) - CLOUDP-329722

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
  // This test will be enable when the xgen-IPA-107-valid-operation-id is set to warning severity - CLOUDP-329722
  /* {
    name: 'invalid methods',
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
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/limits/{limitName}', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-valid-operation-id',
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/settings', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  }, */
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
