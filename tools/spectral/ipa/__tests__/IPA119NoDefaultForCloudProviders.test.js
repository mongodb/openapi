import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-119-no-default-for-cloud-providers', [
  {
    name: 'valid when no default in cloud provider field',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              cloudProvider: {
                type: 'string',
                enum: ['AWS', 'GCP', 'AZURE'],
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid when cloud provider field has default value',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              cloudProvider: {
                type: 'string',
                enum: ['AWS', 'GCP', 'AZURE'],
                default: 'AWS',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-119-no-default-for-cloud-providers',
        message: 'When using a provider field or param, API producers should not define a default value.',
        path: ['components', 'schemas', 'Schema', 'properties', 'cloudProvider'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid when non-provider field has default value',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              region: {
                type: 'string',
                default: 'us-east-1',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'field with provider in name has exception',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              cloudProvider: {
                type: 'string',
                enum: ['AWS', 'GCP', 'AZURE'],
                default: 'AWS',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-119-no-default-for-cloud-providers': 'Reason',
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'parameters with provider in name',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'cloudProvider',
                in: 'query',
                schema: {
                  type: 'string',
                  default: 'AWS',
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-119-no-default-for-cloud-providers',
        message: 'When using a provider field or param, API producers should not define a default value.',
        path: ['paths', '/resources', 'get', 'parameters', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'parameters with provider in name - exceptions',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'cloudProvider',
                in: 'query',
                schema: {
                  type: 'string',
                  default: 'AWS',
                },
                'x-xgen-IPA-exception': {
                  'xgen-IPA-119-no-default-for-cloud-providers': 'Reason',
                },
              },
            ],
          },
        },
      },
    },
    errors: [],
  },
]);
