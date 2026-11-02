import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    SchemaOne: {
      type: 'string',
    },
    SchemaTwoRequest: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          writeOnly: true,
        },
        otherThing: {
          type: 'string',
        },
      },
    },
    SchemaThree: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        someArray: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
    SchemaTwoResponse: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          readOnly: true,
        },
        otherThing: {
          type: 'string',
        },
      },
    },
    SchemaCircularOne: {
      type: 'object',
      properties: {
        thing: {
          $ref: '#/components/schemas/SchemaCircularTwo',
        },
      },
    },
    SchemaCircularTwo: {
      type: 'object',
      properties: {
        otherThing: {
          $ref: '#/components/schemas/SchemaCircularOne',
        },
      },
    },
  },
};

const animals = {
  schemas: {
    Animal: {
      type: 'object',
      oneOf: [
        {
          $ref: '#/components/schemas/Dog',
        },
        {
          $ref: '#/components/schemas/Cat',
        },
      ],
    },
    Dog: {
      allOf: [
        {
          $ref: '#/components/schemas/Animal',
        },
      ],
    },
    Cat: {
      allOf: [
        {
          $ref: '#/components/schemas/Animal',
        },
      ],
    },
  },
};

testRule('xgen-IPA-106-create-method-request-body-is-get-method-response', [
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
                    type: 'string',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaOne',
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
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaOne',
                    },
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
                    $ref: '#/components/schemas/SchemaTwoRequest',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaTwoRequest',
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
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaTwoResponse',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaTwoResponse',
                    },
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
                    $ref: '#/components/schemas/SchemaThree',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaThree',
                  },
                },
              },
            },
          },
        },
        '/resourceThree/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaThree',
                    },
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
                    $ref: '#/components/schemas/SchemaOne',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaOne',
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
                    $ref: '#/components/schemas/SchemaOne',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaOne',
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
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaTwoRequest',
                    },
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
                    $ref: '#/components/schemas/SchemaTwoResponse',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaTwoResponse',
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
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaThree',
                    },
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
                    $ref: '#/components/schemas/SchemaOne',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaThree',
                  },
                },
              },
            },
          },
        },
        '/resourceThree/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaThree',
                    },
                  },
                },
              },
            },
          },
        },
        // Missing schema for Get method
        '/resourceFour': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaOne',
                  },
                },
              },
            },
          },
        },
        '/resourceFour/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {},
                },
              },
            },
          },
        },
        '/resourceCircular': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaCircularOne',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaCircularOne',
                  },
                },
              },
            },
          },
        },
        '/resourceCircular/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaCircularTwo',
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
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resourceTwo', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resourceTwo', 'post', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resourceThree', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message:
          'Could not validate that the Create request body schema matches the response schema of the Get method. The Get method does not have a schema.',
        path: ['paths', '/resourceFour', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resourceCircular', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resourceCircular', 'post', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid oneOf case',
    document: {
      components: animals,
      paths: {
        '/animalResource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/Animal',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/Animal',
                  },
                },
              },
            },
          },
        },
        '/animalResource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/Dog',
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
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/animalResource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/animalResource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Error,
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
                    $ref: '#/components/schemas/SchemaOne',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-get-method-response': 'reason',
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
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaThree',
                    },
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
                    $ref: '#/components/schemas/SchemaTwoRequest',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-get-method-response': 'reason',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaTwoRequest',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-get-method-response': 'reason',
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
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      $ref: '#/components/schemas/SchemaThree',
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
    name: 'valid: dedicated request and response schemas where the response has additional fields',
    document: {
      components: {
        schemas: {
          ResourceRequest: { type: 'object', properties: { name: { type: 'string' } } },
          ResourceResponse: {
            type: 'object',
            properties: { id: { type: 'string' }, name: { type: 'string' }, createdAt: { type: 'string' } },
          },
        },
      },
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': { schema: { $ref: '#/components/schemas/ResourceRequest' } },
              },
            },
          },
        },
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: { $ref: '#/components/schemas/ResourceResponse' },
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
    name: 'valid: writeOnly request property is not required in the response',
    document: {
      components: {
        schemas: {
          ResourceRequest: {
            type: 'object',
            properties: { name: { type: 'string' }, password: { type: 'string', writeOnly: true } },
          },
          ResourceResponse: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
        },
      },
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': { schema: { $ref: '#/components/schemas/ResourceRequest' } },
              },
            },
          },
        },
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: { $ref: '#/components/schemas/ResourceResponse' },
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
    name: 'invalid: request property is missing in the response',
    document: {
      components: {
        schemas: {
          ResourceRequest: {
            type: 'object',
            properties: { name: { type: 'string' }, expiresInHours: { type: 'integer' } },
          },
          ResourceResponse: {
            type: 'object',
            properties: { id: { type: 'string' }, name: { type: 'string' }, expiry: { type: 'string' } },
          },
        },
      },
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': { schema: { $ref: '#/components/schemas/ResourceRequest' } },
              },
            },
          },
        },
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: { $ref: '#/components/schemas/ResourceResponse' },
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
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid: request property has a different type than the response property',
    document: {
      components: {
        schemas: {
          ResourceRequest: { type: 'object', properties: { name: { type: 'string' }, count: { type: 'integer' } } },
          ResourceResponse: {
            type: 'object',
            properties: { id: { type: 'string' }, name: { type: 'string' }, count: { type: 'string' } },
          },
        },
      },
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': { schema: { $ref: '#/components/schemas/ResourceRequest' } },
              },
            },
          },
        },
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: { $ref: '#/components/schemas/ResourceResponse' },
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
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message: 'The request body schema properties must be present in the response body schema of the Get method.',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
