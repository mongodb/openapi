import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    SchemaWithReadOnly: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          readOnly: true,
        },
        name: {
          type: 'string',
        },
      },
    },
    SchemaWithoutReadOnly: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
    NestedSchemaWithReadOnly: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              readOnly: true,
            },
            username: {
              type: 'string',
            },
          },
        },
      },
    },
    ArraySchemaWithReadOnly: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              itemId: {
                type: 'string',
                readOnly: true,
              },
              itemName: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
};

testRule('xgen-IPA-107-update-method-request-has-no-readonly-fields', [
  {
    name: 'valid methods - no readOnly fields',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaWithoutReadOnly',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
          },
          put: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaWithoutReadOnly',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'string',
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
    name: 'invalid methods - direct readOnly field',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaWithReadOnly',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'string',
                    readOnly: true,
                  },
                },
              },
            },
          },
          put: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaWithReadOnly',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'string',
                    readOnly: true,
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
        code: 'xgen-IPA-107-update-method-request-has-no-readonly-fields',
        message:
          'The Update method request object must not include input fields (readOnly properties). Found readOnly property at: id. ',
        path: ['paths', '/resource/{id}', 'patch', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-has-no-readonly-fields',
        message:
          'The Update method request object must not include input fields (readOnly properties). Found readOnly property at one of the inline schemas. ',
        path: ['paths', '/resource/{id}', 'patch', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-has-no-readonly-fields',
        message:
          'The Update method request object must not include input fields (readOnly properties). Found readOnly property at: id. ',
        path: ['paths', '/resource/{id}', 'put', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-has-no-readonly-fields',
        message:
          'The Update method request object must not include input fields (readOnly properties). Found readOnly property at one of the inline schemas. ',
        path: ['paths', '/resource/{id}', 'put', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods - nested readOnly field',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/NestedSchemaWithReadOnly',
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
        code: 'xgen-IPA-107-update-method-request-has-no-readonly-fields',
        message:
          'The Update method request object must not include input fields (readOnly properties). Found readOnly property at: user.userId. ',
        path: ['paths', '/resource/{id}', 'patch', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods - array with readOnly field',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/ArraySchemaWithReadOnly',
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
        code: 'xgen-IPA-107-update-method-request-has-no-readonly-fields',
        message:
          'The Update method request object must not include input fields (readOnly properties). Found readOnly property at: items.items.itemId. ',
        path: ['paths', '/resource/{id}', 'patch', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'methods with exceptions',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaWithReadOnly',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-107-update-method-request-has-no-readonly-fields': 'Reason',
                  },
                },
              },
            },
          },
        },
        '/resource/{id}': {
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaWithReadOnly',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-107-update-method-request-has-no-readonly-fields': 'Reason',
                  },
                },
              },
            },
          },
          put: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaWithReadOnly',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-107-update-method-request-has-no-readonly-fields': 'Reason',
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
