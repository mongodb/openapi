import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-description-must-not-use-html', [
  {
    name: 'valid description',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              valid: {
                description: 'Description.',
              },
              validWithAngleBracket: {
                description: 'Must be < 250 characters.',
              },
              validWithAngleBrackets: {
                description: 'For example <username>:<password>',
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
              html: {
                description: '<a>Description</a>',
              },
              link: {
                description: 'To learn more, see <a href="https://www.mongodb.com/">MongoDB</a>',
              },
              inlineHtml: {
                description: 'This is something. <a>Description</a>',
              },
              selfClosingHtml: {
                description: 'This is something.<br/>With a line break.',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description-must-not-use-html',
        message: 'Descriptions must not use raw HTML.',
        path: ['components', 'schemas', 'Schema', 'properties', 'html'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-must-not-use-html',
        message:
          'Descriptions must not use raw HTML. If you want to link to additional documentation, please use the externalDocumentation property (https://swagger.io/specification/#external-documentation-object).',
        path: ['components', 'schemas', 'Schema', 'properties', 'link'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-must-not-use-html',
        message: 'Descriptions must not use raw HTML.',
        path: ['components', 'schemas', 'Schema', 'properties', 'inlineHtml'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-must-not-use-html',
        message: 'Descriptions must not use raw HTML.',
        path: ['components', 'schemas', 'Schema', 'properties', 'selfClosingHtml'],
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
            properties: {
              html: {
                description: '<a>Description</a>',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-must-not-use-html': 'reason',
                },
              },
              inlineHtml: {
                description: 'This is something. <a>Description</a>',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-must-not-use-html': 'reason',
                },
              },
              selfClosingHtml: {
                description: 'This is something.<br/>With a line break.',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-must-not-use-html': 'reason',
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
