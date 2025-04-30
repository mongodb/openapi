import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-description-should-not-use-inline-links', [
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
              validWithParentheses: {
                description: 'Description (with parentheses).',
              },
              validWithBrackets: {
                description: 'Description [with brackets].',
              },
              validMixed: {
                description: 'Something [with brackets]. Description (with parentheses).',
              },
              validChars: {
                description: 'Something can only be "a-zA-Z[]():,".',
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
              invalidLink: {
                description: 'Hello [world](https://www.mongodb.com).',
              },
              invalidMultipleLinks: {
                description: 'Hello [world](https://www.mongodb.com). And [MongoDB website](https://www.mongodb.com)',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-links',
        message:
          'Descriptions should not include inline links. Use the externalDocumentation property instead, see https://swagger.io/specification/#external-documentation-object.',
        path: ['components', 'schemas', 'Schema', 'properties', 'invalidLink'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description-should-not-use-inline-links',
        message:
          'Descriptions should not include inline links. Use the externalDocumentation property instead, see https://swagger.io/specification/#external-documentation-object.',
        path: ['components', 'schemas', 'Schema', 'properties', 'invalidMultipleLinks'],
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
              invalidLink: {
                description: 'Hello [world](https://www.mongodb.com).',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-should-not-use-inline-links': 'reason',
                },
              },
              invalidMultipleLinks: {
                description: 'Hello [world](https://www.mongodb.com). And [MongoDB website](https://www.mongodb.com)',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description-should-not-use-inline-links': 'reason',
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
