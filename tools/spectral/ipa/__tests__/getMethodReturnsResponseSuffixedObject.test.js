import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    ExampleResponse: {
      properties: {
        exampleProperty: {
          type: 'string',
        },
      },
    },
    ExampleRequest: {
      properties: {
        exampleProperty: {
          type: 'string',
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
        '/resource1/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ExampleResponse',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource2/{id}': {
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
        '/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ExampleResponse',
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
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ExampleRequest',
                    },
                  },
                },
              },
            },
          },
        },
        '/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ExampleRequest',
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
        message: 'ExampleRequest schema name should end in "Response". http://go/ipa/104',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-get-method-returns-response-suffixed-object',
        message: 'ExampleRequest schema name should end in "Response". http://go/ipa/104',
        path: ['paths', '/singleton', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-08-05+json'],
        severity: DiagnosticSeverity.Warning,
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
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-returns-response-suffixed-object': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/ExampleRequest',
                    },
                  },
                },
              },
            },
          },
        },
        '/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-returns-response-suffixed-object': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/ExampleRequest',
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
