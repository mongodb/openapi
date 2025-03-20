import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    SchemaResponse: {
      type: 'object',
    },
    Schema: {
      type: 'object',
    },
    BadRequest: {
      content: {
        'application/json': {
          schema: {
            type: 'string',
          },
        },
      },
    },
  },
};

testRule('xgen-IPA-104-get-method-returns-response-suffixed-object', [
  {
    name: 'valid schema names names',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaResponse',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaResponse',
                    },
                  },
                  'application/vnd.atlas.2025-01-01+json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/SchemaResponse',
                      },
                    },
                  },
                },
              },
              401: {
                $ref: '#/components/schemas/BadRequest',
              },
              400: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/Schema',
                    },
                  },
                },
              },
            },
          },
        },
        '/resourceTwo/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaResponse',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: componentSchemas,
    },
    errors: [],
  },
  {
    name: 'invalid resources',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/Schema',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/Schema',
                    },
                  },
                  'application/vnd.atlas.2025-01-01+json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Schema',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/Schema',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: componentSchemas,
    },
    errors: [
      {
        code: 'xgen-IPA-104-get-method-returns-response-suffixed-object',
        message: 'The schema must reference a schema with a Response suffix.',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-01-01+json',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-104-get-method-returns-response-suffixed-object',
        message: 'The schema must reference a schema with a Response suffix.',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-01-01+json',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-104-get-method-returns-response-suffixed-object',
        message: 'The schema must reference a schema with a Response suffix.',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2025-01-01+json',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-104-get-method-returns-response-suffixed-object',
        message: 'The schema must reference a schema with a Response suffix.',
        path: [
          'paths',
          '/resource/{id}/singleton',
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
    name: 'invalid resources with exceptions',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-returns-response-suffixed-object': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/Schema',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-returns-response-suffixed-object': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/Schema',
                    },
                  },
                  'application/vnd.atlas.2025-01-01+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-returns-response-suffixed-object': 'reason',
                    },
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Schema',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-returns-response-suffixed-object': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/Schema',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: componentSchemas,
    },
    errors: [],
  },
]);
