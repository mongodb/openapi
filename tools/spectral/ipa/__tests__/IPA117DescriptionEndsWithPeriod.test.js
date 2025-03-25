import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-description-ends-with-period', [
  {
    name: 'valid description',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              id: {
                description: 'Description.',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid descriptions',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              noPeriod: {
                description: 'Description',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description-ends-with-period',
        message: 'Descriptions must end with a full stop(.).',
        path: ['components', 'schemas', 'Schema', 'properties', 'noPeriod'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'ignores descriptions ending with table',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              noPeriod: {
                description: 'Description\n| Table |',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid components with exceptions',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              noPeriod: {
                description: 'Description',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-ends-with-period': 'reason',
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
