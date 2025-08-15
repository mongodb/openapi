import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-description-starts-with-uppercase', [
  {
    name: 'valid description',
    document: {
      components: {
        schemas: {
          Schema: {
            description: 'Description',
            properties: {
              id: {
                description: 'Description',
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
            description: 'description',
            properties: {
              noUpperCase: {
                description: 'description',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description-starts-with-uppercase',
        message: 'Descriptions must start with Uppercase.',
        path: ['components', 'schemas', 'Schema'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-starts-with-uppercase',
        message: 'Descriptions must start with Uppercase.',
        path: ['components', 'schemas', 'Schema', 'properties', 'noUpperCase'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid description with exceptions',
    document: {
      components: {
        schemas: {
          Schema: {
            description: 'description',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-description-starts-with-uppercase': 'reason',
            },
            properties: {
              noUpperCase: {
                description: 'description',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-starts-with-uppercase': 'reason',
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
