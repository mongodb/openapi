import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    SchemaOne: {
      type: 'string',
    },
    SchemaTwo: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          readOnly: true,
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
    SchemaFour: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          writeOnly: true,
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
                    $ref: '#/components/schemas/SchemaTwo',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaTwo',
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
                      $ref: '#/components/schemas/SchemaFour',
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
                      $ref: '#/components/schemas/SchemaTwo',
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
                    $ref: '#/components/schemas/SchemaTwo',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaTwo',
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
        message:
          'The request body schema properties must match the response body schema properties of the Get method. http://go/ipa/106',
        path: ['paths', '/resource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message:
          'The request body schema properties must match the response body schema properties of the Get method. http://go/ipa/106',
        path: ['paths', '/resourceTwo', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message:
          'The request body schema properties must match the response body schema properties of the Get method. http://go/ipa/106',
        path: ['paths', '/resourceThree', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-request-body-is-get-method-response',
        message:
          'The request body schema properties must match the response body schema properties of the Get method. http://go/ipa/106',
        path: ['paths', '/resourceCircular', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
        severity: DiagnosticSeverity.Warning,
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
        message:
          'The request body schema properties must match the response body schema properties of the Get method. http://go/ipa/106',
        path: ['paths', '/animalResource', 'post', 'requestBody', 'content', 'application/vnd.atlas.2023-01-01+json'],
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
                    $ref: '#/components/schemas/SchemaOne',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-get-method-response': 'reason',
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
                      $ref: '#/components/schemas/SchemaTwo',
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
                    $ref: '#/components/schemas/SchemaTwo',
                  },
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-get-method-response': 'reason',
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    $ref: '#/components/schemas/SchemaTwo',
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
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-106-create-method-request-body-is-get-method-response': 'reason',
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
      },
    },
    errors: [],
  },
]);
