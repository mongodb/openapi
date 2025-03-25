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

testRule('xgen-IPA-106-create-method-request-has-no-readonly-fields', [
  {
    name: 'valid methods - no readOnly fields',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
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
        '/resource/{id}': {
          get: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid methods - custom method can have readOnly fields',
    document: {
      components: componentSchemas,
      paths: {
        '/resource:customAction': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaWithReadOnly',
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
        '/resource': {
          post: {
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
        '/resource/{id}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-create-method-request-has-no-readonly-fields',
        message:
          'The Create method request object must not include input fields (readOnly properties). Found readOnly property at: id. ',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-has-no-readonly-fields',
        message:
          'The Create method request object must not include input fields (readOnly properties). Found readOnly property at one of the inline schemas. ',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid methods - nested readOnly field',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
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
        '/resource/{id}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-create-method-request-has-no-readonly-fields',
        message:
          'The Create method request object must not include input fields (readOnly properties). Found readOnly property at: user.userId. ',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid methods - array with readOnly field',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
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
        '/resource/{id}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-create-method-request-has-no-readonly-fields',
        message:
          'The Create method request object must not include input fields (readOnly properties). Found readOnly property at: items.items.itemId. ',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
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
                    'xgen-IPA-106-create-method-request-has-no-readonly-fields': 'Reason',
                  },
                },
              },
            },
          },
        },
        '/resource/{id}': {
          get: {},
        },
      },
    },
    errors: [],
  },
]);
