import testRule from './__helpers__/testRule';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294
// TOOD: enable tests for invalid methods (after rules are upgraded to warning) - CLOUDP-329722

testRule('xgen-IPA-106-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/clusters': {
          post: {
            operationId: 'createGroupCluster',
          },
        },
      },
    },
    errors: [],
  },
  // This test will be enable when the xgen-IPA-106-valid-operation-id is set to warning severity - CLOUDP-329722
  /* {
    name: 'invalid methods',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/access': {
          post: {
            operationId: 'addUserToProject',
          },
        },
        '/api/atlas/v2/groups/{groupId}/invites': {
          post: {
            operationId: 'createProjectInvitation',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-valid-operation-id',
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/access', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-valid-operation-id',
        message:
          'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/invites', 'post'],
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
            operationId: 'createRollingIndex',
            'x-xgen-IPA-exception': {
              'xgen-IPA-106-valid-operation-id': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
