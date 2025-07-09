import testRule from './__helpers__/testRule';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294
// TOOD: enable tests for invalid methods (after rules are upgraded to warning) - CLOUDP-329722

testRule('xgen-IPA-108-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/groups/{groupId}/clusters/{clusterName}': {
          delete: {
            operationId: 'deleteGroupCluster',
          },
        },
      },
    },
    errors: [],
  },
  // This test will be enable when the xgen-IPA-108-valid-operation-id is set to warning severity - CLOUDP-329722
  /* {
    name: 'invalid methods',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/apiKeys/{apiUserId}': {
          delete: {
            operationId: 'removeProjectApiKey',
          },
        },
        '/api/atlas/v2/groups/{groupId}': {
          delete: {
            operationId: 'deleteProject',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message:
          'Invalid OperationID. The Operation ID must start with the verb “delete” and should be followed by a noun or compound noun. The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/apiKeys/{apiUserId}', 'delete'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-108-valid-operation-id',
        message:
          'Invalid OperationID. The Operation ID must start with the verb “delete” and should be followed by a noun or compound noun. The noun(s) in the Operation ID should be the collection identifiers from the resource identifier in singular form. ',
        path: ['paths', '/api/atlas/v2/groups/{groupId}', 'delete'],
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
            operationId: 'deleteRollingIndex',
            'x-xgen-IPA-exception': {
              'xgen-IPA-108-valid-operation-id': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
