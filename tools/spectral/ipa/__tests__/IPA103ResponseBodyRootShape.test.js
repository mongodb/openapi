import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-103-response-body-root-shape', [
  {
    name: 'valid object response bodies',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-08-05+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  // Collection envelope per IPA-110
                  'application/vnd.atlas.2023-08-05+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        results: { type: 'array', items: { type: 'object' } },
                        links: { type: 'array', items: { type: 'object' } },
                        totalCount: { type: 'integer' },
                      },
                    },
                  },
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
    name: 'valid discriminated oneOf response body',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-08-05+json': {
                    schema: {
                      oneOf: [
                        { type: 'object', properties: { a: { type: 'string' } } },
                        { type: 'object', properties: { b: { type: 'string' } } },
                      ],
                    },
                  },
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
    name: 'responses without a schema and non-JSON responses are ignored',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-08-05+json': {
                    example: 'no schema',
                  },
                  'text/csv': {
                    schema: { type: 'array', items: { type: 'string' } },
                  },
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
    name: 'invalid response bodies',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  // Array root
                  'application/vnd.atlas.2023-08-05+json': {
                    schema: { type: 'array', items: { type: 'object' } },
                  },
                  // Primitive root
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  // Object with only additionalProperties
                  'application/vnd.atlas.2023-08-05+json': {
                    schema: { type: 'object', additionalProperties: { type: 'string' } },
                  },
                  // oneOf with a non-object variant
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      oneOf: [{ type: 'object', properties: { a: { type: 'string' } } }, { type: 'string' }],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-103-response-body-root-shape',
        message:
          'Response bodies must be a JSON object with named properties, or a oneOf whose variants are all objects.',
        path: ['paths', '/resource', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2023-08-05+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-103-response-body-root-shape',
        message:
          'Response bodies must be a JSON object with named properties, or a oneOf whose variants are all objects.',
        path: ['paths', '/resource', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-08-05+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-103-response-body-root-shape',
        message:
          'Response bodies must be a JSON object with named properties, or a oneOf whose variants are all objects.',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-08-05+json',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-103-response-body-root-shape',
        message:
          'Response bodies must be a JSON object with named properties, or a oneOf whose variants are all objects.',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid response body with exception',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-08-05+json': {
                    schema: { type: 'array', items: { type: 'object' } },
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-103-response-body-root-shape': 'Reason',
                    },
                  },
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
