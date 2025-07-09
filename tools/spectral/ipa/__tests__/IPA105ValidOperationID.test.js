import testRule from './__helpers__/testRule';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294
// TOOD: enable tests for invalid methods (after rules are upgraded to warning) - CLOUDP-329722

const componentSchemas = {
  schemas: {
    Schema: {
      type: 'object',
    },
  },
  operationId: 'string',
};

testRule('xgen-IPA-105-valid-operation-id', [
  {
    name: 'valid methods',
    document: {
      components: componentSchemas,
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
      components: componentSchemas,
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
          'Invalid OperationID. The Operation ID must start with the verb “list” and should be followed by a noun or compound noun. The noun(s) should be the collection identifiers from the resource identifier in singular form, where the last noun is in plural form.',
        path: ['paths', '/api/atlas/v2/groups/{groupId}/databaseUsers/{username}/certs', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-valid-operation-id',
        message:
          'Invalid OperationID. The Operation ID must start with the verb “list” and should be followed by a noun or compound noun. The noun(s) should be the collection identifiers from the resource identifier in singular form, where the last noun is in plural form.',
        path: ['paths', '/api/atlas/v2/orgs/{orgId}/events', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  }, */
  {
    name: 'invalid methods with exceptions',
    document: {
      components: componentSchemas,
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
