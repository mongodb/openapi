import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-description-should-not-use-inline-tables', [
  {
    name: 'valid description',
    document: {
      components: {
        schemas: {
          Schema: {
            description: 'Schema for request | response',
            properties: {
              valid: {
                description: 'Description.',
              },
              validWithVerticalBar: {
                description: 'Must be true | false',
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
            description: '|Title|\n|-----|\n|Description|',
            properties: {
              table: {
                description: '|Title|\n|-----|\n|Description|',
              },
              tableLeftAlignment: {
                description: '|Title|\n|:-----|\n|Description|',
              },
              tableCenterAlignment: {
                description: '|Title|\n|:-----:|\n|Description|',
              },
              tableRightAlignment: {
                description: '|Title|\n|-----:|\n|Description|',
              },
              largeTable: {
                description: '|Title|H1|H2|H3\n|-----|\n|Description|Description1|Description2|Description3|',
              },
              tableWithSpaces: {
                description: '|Title|\n| ----- |\n|Description|',
              },
              tableWithSpacesLeftAlignment: {
                description: '|Title|\n| :----- |\n|Description|',
              },
              tableWithSpacesCenterAlignment: {
                description: '|Title|\n| :-----: |\n|Description|',
              },
              tableWithSpacesRightAlignment: {
                description: '|Title|\n| -----: |\n|Description|',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'table'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'tableLeftAlignment'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'tableCenterAlignment'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'tableRightAlignment'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'largeTable'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'tableWithSpaces'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'tableWithSpacesLeftAlignment'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'tableWithSpacesCenterAlignment'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-tables',
        message:
          'Descriptions should not include inline tables. Tables may not work well with all tools, in particular generated client code.',
        path: ['components', 'schemas', 'Schema', 'properties', 'tableWithSpacesRightAlignment'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid descriptions with exceptions',
    document: {
      components: {
        schemas: {
          Schema: {
            description: '|Title|\n|-----|\n|Description|',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-description-should-not-use-inline-tables': 'reason',
            },
            properties: {
              table: {
                description: '|Title|\n|-----|\n|Description|',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-should-not-use-inline-tables': 'reason',
                },
              },
              tableLeftAlignment: {
                description: '|Title|\n|:-----|\n|Description|',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-should-not-use-inline-tables': 'reason',
                },
              },
              tableCenterAlignment: {
                description: '|Title|\n|:-----:|\n|Description|',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-should-not-use-inline-tables': 'reason',
                },
              },
              tableRightAlignment: {
                description: '|Title|\n|-----:|\n|Description|',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-should-not-use-inline-tables': 'reason',
                },
              },
              largeTable: {
                description: '|Title|H1|H2|H3\n|--------------|\n|Description|Description1|Description2|Description3|',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-should-not-use-inline-tables': 'reason',
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
