import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-oneof-property-descriptions-must-match', [
  {
    name: 'valid oneOf with matching shared property descriptions',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'The identifier.' },
                  name: { type: 'string', description: 'The name.' },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'The identifier.' },
                  nickname: { type: 'string', description: 'The nickname.' },
                },
              },
            ],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid oneOf with a single variant',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'The identifier.' },
                },
              },
            ],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid oneOf with diverging shared property descriptions',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'The identifier.' },
                  status: { type: 'string', description: 'The status.' },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'A unique identifier.' },
                  status: { type: 'string', description: 'The current status.' },
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-oneof-property-descriptions-must-match',
        message:
          "Property 'id' has diverging descriptions across oneOf variants. Shared properties must use the same description.",
        path: ['components', 'schemas', 'ExampleSchema'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-oneof-property-descriptions-must-match',
        message:
          "Property 'status' has diverging descriptions across oneOf variants. Shared properties must use the same description.",
        path: ['components', 'schemas', 'ExampleSchema'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid oneOf where one variant omits the description',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'The identifier.' },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-oneof-property-descriptions-must-match',
        message:
          "Property 'id' has diverging descriptions across oneOf variants. Shared properties must use the same description.",
        path: ['components', 'schemas', 'ExampleSchema'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid oneOf with exception',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-oneof-property-descriptions-must-match': 'Reason',
            },
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'The identifier.' },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'A different description.' },
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
