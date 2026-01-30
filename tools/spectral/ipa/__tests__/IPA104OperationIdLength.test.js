import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-operation-id-length', [
  {
    name: 'valid operation ID with 4 words or less',
    document: {
      paths: {
        '/groups/{groupId}/cluster/{clusterName}': {
          get: {
            operationId: 'getGroupCluster',
          },
        },
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/fts/indexes': {
          get: {
            operationId: 'getGroupClusterFtsIndexes',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'operation ID longer than 4 words without override',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/alerts/{alertId}/alertConfigs/{alertConfigId}': {
          get: {
            operationId: 'getGroupAlertAlertConfigAlertConfig',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-operation-id-length',
        message:
          "The Operation ID is longer than 4 words. Please add an 'x-xgen-operation-id-override' extension to the operation with a shorter operation ID. For example: 'getAlertAlertConfig'.",
        path: [
          'paths',
          '/api/atlas/v2/groups/{groupId}/alerts/{alertId}/alertConfigs/{alertConfigId}',
          'get',
          'operationId',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'operation ID longer than 4 words with valid override',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/alerts/{alertId}/alertConfigs/{alertConfigId}': {
          get: {
            operationId: 'getGroupAlertAlertConfigAlertConfig',
            'x-xgen-operation-id-override': 'getAlertConfig',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'operation ID longer than 4 words with exception',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/alerts/{alertId}/alertConfigs/{alertConfigId}': {
          get: {
            operationId: 'getGroupAlertAlertConfigAlertConfig',
            'x-xgen-IPA-exception': {
              'xgen-IPA-104-operation-id-length': 'Legacy operation ID, used in existing client SDKs.',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'operation ID with verb override',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/streams/{tenantName}': {
          get: {
            operationId: 'getGroupStreamWorkspace',
            'x-xgen-method-verb-override': {
              verb: 'getWorkspace',
              customMethod: false,
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'custom method should be ignored',
    document: {
      paths: {
        '/api/atlas/v2/groups/{groupId}/clusters/{clusterName}:pause': {
          post: {
            operationId: 'pauseGroupCluster',
          },
        },
      },
    },
    errors: [],
  },
]);
