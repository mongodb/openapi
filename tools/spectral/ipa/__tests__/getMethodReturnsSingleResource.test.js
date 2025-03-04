import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    Schema: {
      properties: {
        exampleProperty: {
          type: 'string',
        },
      },
    },
    PaginatedSchema: {
      type: 'array',
    },
    ArraySchema: {
      properties: {
        results: {
          type: 'array',
        },
      },
    },
  },
};

testRule('xgen-IPA-104-get-method-returns-single-resource', [
  {
    name: 'valid resources',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedSchema',
                    },
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
        '/resource/{id}:getAllThings': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ArraySchema',
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
    errors: [],
  },
  {
    name: 'invalid resources',
    document: {
      paths: {
        '/arrayResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedSchema',
                    },
                  },
                },
              },
            },
          },
        },
        '/arrayResource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ArraySchema',
                    },
                  },
                },
              },
            },
          },
        },
        '/paginatedResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedSchema',
                    },
                  },
                },
              },
            },
          },
        },
        '/paginatedResource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedSchema',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/arraySingleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ArraySchema',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/paginatedSingleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedSchema',
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
        code: 'xgen-IPA-104-get-method-returns-single-resource',
        message:
          'Get methods should return data for a single resource. This method returns an array or a paginated response. http://go/ipa/104',
        path: [
          'paths',
          '/arrayResource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-get-method-returns-single-resource',
        message:
          'Get methods should return data for a single resource. This method returns an array or a paginated response. http://go/ipa/104',
        path: [
          'paths',
          '/paginatedResource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-get-method-returns-single-resource',
        message:
          'Get methods should return data for a single resource. This method returns an array or a paginated response. http://go/ipa/104',
        path: [
          'paths',
          '/resource/{id}/arraySingleton',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-get-method-returns-single-resource',
        message:
          'Get methods should return data for a single resource. This method returns an array or a paginated response. http://go/ipa/104',
        path: [
          'paths',
          '/resource/{id}/paginatedSingleton',
          'get',
          'responses',
          '200',
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
        '/arrayResource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-returns-single-resource': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/ArraySchema',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/paginatedSingleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-returns-single-resource': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/PaginatedSchema',
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
