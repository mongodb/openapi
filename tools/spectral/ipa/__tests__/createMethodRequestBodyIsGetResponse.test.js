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
