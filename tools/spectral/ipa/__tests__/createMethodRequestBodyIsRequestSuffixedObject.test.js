import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    SchemaRequest: {
      type: 'object',
    },
    Schema: {
      type: 'object',
    },
  },
};
testRule('xgen-IPA-106-create-method-request-body-is-request-suffixed-object', [
  {
    name: 'valid methods',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaRequest',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaRequest',
                  },
                },
                'application/vnd.atlas.2025-01-01+json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/SchemaRequest',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}': {
          post: {
            requestBody: {
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
              },
            },
          },
        },
        '/resource/{id}:customMethod': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/Schema',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaRequest',
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
    name: 'invalid methods',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/Schema',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
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
        '/resource/{id}': {
          get: {},
        },
        '/resourceTwo': {
          post: {
            requestBody: {
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
              },
            },
          },
        },
        '/resourceTwo/{id}': {
          get: {},
        },
        '/resourceThree': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
        '/resourceThree/{id}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object',
        message: 'The response body schema must reference a schema with a Request suffix. http://go/ipa/106',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object',
        message: 'The response body schema must reference a schema with a Request suffix. http://go/ipa/106',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object',
        message: 'The response body schema must reference a schema with a Request suffix. http://go/ipa/106',
        path: ['paths', '/resourceTwo', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object',
        message: 'The response body schema must reference a schema with a Request suffix. http://go/ipa/106',
        path: ['paths', '/resourceTwo', 'post', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object',
        message: 'The response body schema is defined inline and must reference a predefined schema. http://go/ipa/106',
        path: ['paths', '/resourceThree', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/Schema',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-request-suffixed-object': 'reason',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Schema',
                    },
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-request-suffixed-object': 'reason',
                  },
                },
              },
            },
          },
        },
        '/resourceTwo': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/Schema',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-request-suffixed-object': 'reason',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/Schema',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-request-suffixed-object': 'reason',
                  },
                },
              },
            },
          },
        },
        '/resourceThree': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    type: 'object',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-request-suffixed-object': 'reason',
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
