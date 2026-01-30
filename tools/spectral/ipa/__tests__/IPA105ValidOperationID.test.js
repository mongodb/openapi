import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

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
    name: 'invalid methods with short opIDs',
    document: {
      paths: {
        '/api/atlas/v2/unauth/openapi/versions': {
          get: {
            operationId: 'getApiVersions',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-105-valid-operation-id',
        message: "Invalid OperationID. Found 'getApiVersions', expected 'listOpenapiVersions'. ",
        path: ['paths', '/api/atlas/v2/unauth/openapi/versions', 'get', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
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
        message:
          "Invalid OperationID. Found 'returnAllControlPlaneIpAddresses', expected 'listControlPlaneIpAddresses'. ",
        path: ['paths', '/api/atlas/v2/unauth/controlPlaneIPAddresses', 'get', 'operationId'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid methods with valid overrides',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/backup/exportBuckets': {
          get: {
            operationId: 'listGroupBackupExportBuckets',
            'x-xgen-operation-id-override': 'listExportBuckets',
          },
        },
        '/api/atlas/v2/unauth/controlPlaneIPAddresses': {
          get: {
            operationId: 'listControlPlaneIpAddresses',
            'x-xgen-operation-id-override': 'listControlPlaneAddresses',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid methods with invalid overrides',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/backup/exportBuckets': {
          get: {
            operationId: 'listGroupBackupExportBuckets',
            'x-xgen-operation-id-override': 'listMyExports',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-105-valid-operation-id',
        message:
          "The operation ID override must only contain nouns from the operation ID 'listGroupBackupExportBuckets'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/backup/exportBuckets', 'get', 'x-xgen-operation-id-override'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-105-valid-operation-id',
        message: "The operation ID override must end with the noun 'Buckets'. ",
        path: ['paths', '/api/atlas/v2/groups/{groupId}/backup/exportBuckets', 'get', 'x-xgen-operation-id-override'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid method with verb overrides',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/serverless': {
          get: {
            operationId: 'listGroupServerlessInstances',
            'x-xgen-method-verb-override': {
              verb: 'listInstances',
              customMethod: false,
            },
            'x-xgen-operation-id-override': 'listServerlessInstances',
          },
        },
      },
    },
    errors: [],
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
  {
    name: 'valid method that needs ignoreList',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/hosts/{processId}/fts/metrics': {
          get: {
            operationId: 'listGroupHostFtsMetrics',
            'x-xgen-operation-id-override': 'listHostFtsMetrics',
          },
        },
      },
    },
    errors: [],
  },
]);
