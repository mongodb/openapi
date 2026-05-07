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
                  // Custom method POST response may be empty
                  'application/vnd.atlas.2024-08-05+json': {},
                },
              },
              400: {
                $ref: '#/components/responses/Error',
              },
            },
          },
          get: {
            responses: {
              200: {
                content: {
                  // Valid schema
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource': {
          post: {
            responses: {
              200: {
                content: {
                  // Valid schema
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      type: 'string',
                    },
                  },
                  // Valid schema
                  'application/vnd.atlas.2023-08-05+json': {
                    schema: {
                      properties: {
                        name: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
              202: {
                content: {
                  // 202 response may be empty
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
                // Valid schema
                'application/vnd.atlas.2023-08-05+json': {
                  schema: {
                    type: 'string',
                  },
                  example: {
                    name: 'Test',
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
                  // Valid schema
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/Schema',
                    },
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
                  // DELETE response may be empty
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
                // Invalid empty request body
                'application/vnd.atlas.2024-08-05+json': {},
              },
            },
            responses: {
              200: {
                content: {
                  // Valid, custom method POST response may be empty
                  'application/vnd.atlas.2024-08-05+json': {},
                },
              },
              400: {
                $ref: '#/components/responses/Error',
              },
            },
          },
          get: {
            responses: {
              200: {
                content: {
                  // Invalid empty response body
                  'application/vnd.atlas.2024-08-05+json': {},
                },
              },
            },
          },
        },
        '/resource': {
          post: {
            responses: {
              200: {
                content: {
                  // Invalid empty response body
                  'application/vnd.atlas.2024-08-05+json': {},
                  // Invalid empty response body
                  'application/vnd.atlas.2023-08-05+json': {
                    description: 'A response without a schema or example',
                  },
                },
              },
            },
            requestBody: {
              content: {
                // Invalid empty request body
                'application/vnd.atlas.2023-08-05+json': {
                  schema: {},
                },
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
        message: 'Request and response bodies must have a schema.',
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
        message: 'Request and response bodies must have a schema.',
        path: [
          'paths',
          '/resource/{id}:customMethod',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-request-response-bodies-must-be-well-defined',
        message: 'Request and response bodies must have a schema.',
        path: ['paths', '/resource', 'post', 'responses', '200', 'content', 'application/vnd.atlas.2024-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-request-response-bodies-must-be-well-defined',
        message: 'Request and response bodies must have a schema.',
        path: ['paths', '/resource', 'post', 'responses', '200', 'content', 'application/vnd.atlas.2023-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-request-response-bodies-must-be-well-defined',
        message: 'Request and response bodies must have a schema.',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid OAS with exceptions',
    document: {
      paths: {
        '/resource': {
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
                  schema: {},
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
