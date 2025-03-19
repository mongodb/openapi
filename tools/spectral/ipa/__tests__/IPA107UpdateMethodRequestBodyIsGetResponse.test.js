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

testRule('xgen-IPA-107-update-method-request-body-is-get-method-response', [
  {
    name: 'valid methods',
    document: {
      components: componentSchemas,
      paths: {
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
          patch: {
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
          put: {
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
          patch: {
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
          patch: {
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
        '/resource/{id}:customMethod': {
          patch: {
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
          patch: {
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
          put: {
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
          patch: {
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
          patch: {
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
          patch: {
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
          patch: {
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
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: ['paths', '/resource/{id}', 'patch', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: ['paths', '/resource/{id}', 'patch', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: ['paths', '/resource/{id}', 'put', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: ['paths', '/resource/{id}', 'put', 'requestBody', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: [
          'paths',
          '/resourceTwo/{id}',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: [
          'paths',
          '/resourceTwo/{id}',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: [
          'paths',
          '/resourceThree/{id}',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'Could not validate that the Update request body schema matches the response schema of the Get method. The Get method does not have a schema.',
        path: [
          'paths',
          '/resourceFour/{id}',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: [
          'paths',
          '/resourceCircular/{id}',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: [
          'paths',
          '/resourceCircular/{id}',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid oneOf case',
    document: {
      components: animals,
      paths: {
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
          patch: {
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
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: [
          'paths',
          '/animalResource/{id}',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-request-body-is-get-method-response',
        message:
          'The request body schema properties of the Update method must match the response body schema properties of the Get method.',
        path: [
          'paths',
          '/animalResource/{id}',
          'patch',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      components: componentSchemas,
      paths: {
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
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaOne',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-107-update-method-request-body-is-get-method-response': 'reason',
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
                },
              },
            },
          },
          patch: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaTwoRequest',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-107-update-method-request-body-is-get-method-response': 'reason',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaTwoRequest',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-107-update-method-request-body-is-get-method-response': 'reason',
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
