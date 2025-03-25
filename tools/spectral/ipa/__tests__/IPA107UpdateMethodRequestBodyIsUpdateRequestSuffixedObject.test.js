import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    SchemaUpdateRequest: {
      type: 'object',
    },
    Schema: {
      type: 'object',
    },
  },
};

testRule('xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object', [
  {
    name: 'valid schema names names',
    document: {
      paths: {
        '/resource/{id}': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaUpdateRequest',
                  },
                },
                'application/vnd.atlas.2025-01-01+json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/SchemaUpdateRequest',
                    },
                  },
                },
              },
            },
          },
          put: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaUpdateRequest',
                  },
                },
                'application/vnd.atlas.2025-01-01+json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/SchemaUpdateRequest',
                    },
                  },
                },
              },
            },
          },
        },
        '/resourceTwo/{id}': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  type: 'string',
                },
              },
            },
          },
        },
        '/resource/{id}/singleton': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaUpdateRequest',
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
          patch: {
            requestBody: {
              content: {
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
          put: {
            requestBody: {
              content: {
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
        '/resource/{id}/singleton': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  schema: {
                    $ref: '#/components/schemas/Schema',
                  },
                },
              },
            },
          },
          put: {
            requestBody: {
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
      components: componentSchemas,
    },
    errors: [
      {
        code: 'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object',
        message: 'The schema must reference a schema with a UpdateRequest suffix.',
        path: ['paths', '/resource/{id}', 'patch', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object',
        message: 'The schema must reference a schema with a UpdateRequest suffix.',
        path: ['paths', '/resource/{id}', 'patch', 'requestBody', 'content', 'application/vnd.atlas.2025-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object',
        message: 'The schema must reference a schema with a UpdateRequest suffix.',
        path: ['paths', '/resource/{id}', 'put', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object',
        message: 'The schema must reference a schema with a UpdateRequest suffix.',
        path: ['paths', '/resource/{id}', 'put', 'requestBody', 'content', 'application/vnd.atlas.2025-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object',
        message: 'The schema must reference a schema with a UpdateRequest suffix.',
        path: [
          'paths',
          '/resource/{id}/singleton',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object',
        message: 'The schema must reference a schema with a UpdateRequest suffix.',
        path: [
          'paths',
          '/resource/{id}/singleton',
          'put',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid resources with exceptions',
    document: {
      paths: {
        '/resource/{id}': {
          patch: {
            requestBody: {
              'application/vnd.atlas.2024-01-01+json': {
                'x-xgen-IPA-exception': {
                  'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object': 'reason',
                },
                schema: {
                  $ref: '#/components/schemas/Schema',
                },
              },
              'application/vnd.atlas.2025-01-01+json': {
                'x-xgen-IPA-exception': {
                  'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object': 'reason',
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
          put: {
            requestBody: {
              'application/vnd.atlas.2024-01-01+json': {
                'x-xgen-IPA-exception': {
                  'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object': 'reason',
                },
                schema: {
                  $ref: '#/components/schemas/Schema',
                },
              },
              'application/vnd.atlas.2025-01-01+json': {
                'x-xgen-IPA-exception': {
                  'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object': 'reason',
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
        '/resource/{id}/singleton': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object': 'reason',
                  },
                  schema: {
                    $ref: '#/components/schemas/Schema',
                  },
                },
              },
            },
          },
          put: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-107-update-method-request-body-is-update-request-suffixed-object': 'reason',
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
      components: componentSchemas,
    },
    errors: [],
  },
]);
