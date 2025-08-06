import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

// TODO: add tests for xgen-custom-method extension - CLOUDP-306294

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
  {
    name: 'invalid methods with too long opIDs',
    document: {
      paths: {
        '/api/atlas/v2/unauth/controlPlaneIPAddresses': {
          get: {
            operationId: 'returnAllControlPlaneIpAddresses',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-105-valid-operation-id',
        message: 'Invalid OperationID. ',
        path: ['paths', '/api/atlas/v2/unauth/controlPlaneIPAddresses', 'get', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-valid-operation-id',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. For example: 'listPlaneIPAddresses'. https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-105-valid-operation-id",
        path: ['paths', '/api/atlas/v2/unauth/controlPlaneIPAddresses', 'get', 'operationId'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
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
