import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-request-response-bodies-must-be-well-defined', [
  {
    name: 'valid requests and responses',
    document: {
      paths: {
        '/resource/{id}:customMethod': {
          post: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {},
                },
              },
              400: {
                $ref: '#/components/responses/Error',
              },
            },
          },
        },
        '/resource/{id}': {
          post: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {},
                  },
                  'application/vnd.atlas.2023-08-05+json': {
                    properties: {
                      name: {
                        type: 'object',
                        properties: {},
                      },
                      hobbies: {
                        type: 'array',
                        items: {
                          type: 'object',
                          example: 'test',
                        },
                      },
                    },
                  },
                },
              },
              202: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {},
                },
              },
              400: {
                $ref: '#/components/responses/Error',
              },
              401: {
                $ref: '#/components/responses/Error',
              },
              500: {
                $ref: '#/components/responses/Error',
              },
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2023-08-05+json': {
                  examples: {},
                },
              },
            },
          },
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    $ref: '#/components/schemas/Schema',
                  },
                },
              },
              400: {
                $ref: '#/components/responses/Error',
              },
              401: {
                $ref: '#/components/responses/Error',
              },
              500: {
                $ref: '#/components/responses/Error',
              },
            },
          },
          delete: {
            responses: {
              204: {
                content: {
                  'application/vnd.atlas.2023-11-15+json': {},
                },
                description: 'No Response',
              },
              400: {
                $ref: '#/components/responses/Error',
              },
              401: {
                $ref: '#/components/responses/Error',
              },
              500: {
                $ref: '#/components/responses/Error',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Schema: {
            type: 'object',
          },
        },
        responses: {
          Error: {
            type: 'object',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid requests and responses',
    document: {
      paths: {
        '/resource/{id}:customMethod': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {},
              },
            },
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {},
                },
              },
              400: {
                $ref: '#/components/responses/Error',
              },
            },
          },
        },
        '/resource/{id}': {
          post: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {},
                  'application/vnd.atlas.2023-08-05+json': {
                    description: 'A response without a schema or example',
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2023-08-05+json': {},
              },
            },
          },
        },
      },
      components: {
        responses: {
          Error: {
            type: 'object',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-request-response-bodies-must-be-well-defined',
        message: 'Request and response bodies must be well-defined, i.e. include a schema or example(s).',
        path: [
          'paths',
          '/resource/{id}:customMethod',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-request-response-bodies-must-be-well-defined',
        message: 'Request and response bodies must be well-defined, i.e. include a schema or example(s).',
        path: [
          'paths',
          '/resource/{id}',
          'post',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-request-response-bodies-must-be-well-defined',
        message: 'Request and response bodies must be well-defined, i.e. include a schema or example(s).',
        path: [
          'paths',
          '/resource/{id}',
          'post',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-request-response-bodies-must-be-well-defined',
        message: 'Request and response bodies must be well-defined, i.e. include a schema or example(s).',
        path: ['paths', '/resource/{id}', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid OAS with exceptions',
    document: {
      paths: {
        '/resource/{id}': {
          post: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-117-request-response-bodies-must-be-well-defined': 'reason',
                    },
                  },
                  'application/vnd.atlas.2023-08-05+json': {
                    description: 'A response without a schema or example',
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-117-request-response-bodies-must-be-well-defined': 'reason',
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2023-08-05+json': {
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-117-request-response-bodies-must-be-well-defined': 'reason',
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
