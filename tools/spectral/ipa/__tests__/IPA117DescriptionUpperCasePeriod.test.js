import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-description-uppercase-period', [
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
              noUpperCase: {
                description: 'description.',
              },
              noUpperCaseNoPeriod: {
                description: 'description',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description-uppercase-period',
        message: 'Descriptions must end with a full stop(.).',
        path: ['components', 'schemas', 'Schema', 'properties', 'noPeriod'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-description-uppercase-period',
        message: 'Descriptions must start with Uppercase.',
        path: ['components', 'schemas', 'Schema', 'properties', 'noUpperCase'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-description-uppercase-period',
        message: 'Descriptions must start with Uppercase.',
        path: ['components', 'schemas', 'Schema', 'properties', 'noUpperCaseNoPeriod'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-description-uppercase-period',
        message: 'Descriptions must end with a full stop(.).',
        path: ['components', 'schemas', 'Schema', 'properties', 'noUpperCaseNoPeriod'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
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
                  'xgen-IPA-117-description-uppercase-period': 'reason',
                },
              },
              noUpperCase: {
                description: 'description.',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-uppercase-period': 'reason',
                },
              },
              noUpperCaseNoPeriod: {
                description: 'description',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-uppercase-period': 'reason',
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
