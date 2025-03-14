import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    PaginatedResourceSchema: {
      properties: {
        results: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ResourceSchema',
          },
        },
      },
    },
    ResourceSchema: {
      type: 'object',
    },
    PaginatedArraySchema: {
      properties: {
        results: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ArraySchema',
          },
        },
      },
    },
    ArraySchema: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

testRule('xgen-IPA-105-list-method-response-is-get-method-response', [
  {
    name: 'valid list',
    document: {
      paths: {
        // Using ref
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedResourceSchema',
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
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Inline schema
        '/arrayResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      properties: {
                        results: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ArraySchema',
                          },
                        },
                      },
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
        // Multiple versions
        '/versionedResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedResourceSchema',
                    },
                  },
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedArraySchema',
                    },
                  },
                },
              },
            },
          },
        },
        '/versionedResource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ArraySchema',
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
    name: 'rule ignores inapplicable cases',
    document: {
      paths: {
        // No Get method
        '/resource': {
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
        // Singleton
        '/resource/{id}/singleton': {
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
        // Not paginated (covered by separate rule, IPA 110)
        '/resource/{id}/unPaginated': {
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
        '/resource/{id}/unPaginated/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Version mismatch
        '/versionedResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        '/versionedResource/{id}': {
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
      },
      components: componentSchemas,
    },
    errors: [],
  },
  {
    name: 'invalid list',
    document: {
      paths: {
        // Using ref
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedArraySchema',
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
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Inline schema
        '/arrayResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      properties: {
                        results: {
                          type: 'array',
                          items: {
                            schema: {
                              $ref: '#/components/schemas/ResourceSchema',
                            },
                          },
                        },
                      },
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
        // Get without schema
        '/resourceTwo': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedResourceSchema',
                    },
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
                  'application/vnd.atlas.2024-01-05+json': {},
                },
              },
            },
          },
        },
        // Get without schema ref
        '/resourceThree': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedResourceSchema',
                    },
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
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      type: 'object',
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
        code: 'xgen-IPA-105-list-method-response-is-get-method-response',
        message:
          'The schema of each result in the List method response must be the same schema as the response of the Get method. http://go/ipa-spectral#IPA-105',
        path: ['paths', '/resource', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-list-method-response-is-get-method-response',
        message:
          'The schema of each result in the List method response must be the same schema as the response of the Get method. http://go/ipa-spectral#IPA-105',
        path: [
          'paths',
          '/arrayResource',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-list-method-response-is-get-method-response',
        message:
          'Could not validate that the List method returns the same resource object as the Get method. The Get method does not have a schema. http://go/ipa-spectral#IPA-105',
        path: ['paths', '/resourceTwo', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-01-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-list-method-response-is-get-method-response',
        message:
          'Could not validate that the List method returns the same resource object as the Get method. The Get method does not have a schema reference. http://go/ipa-spectral#IPA-105',
        path: [
          'paths',
          '/resourceThree',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-01-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid list with version mismatch',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedResourceSchema',
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
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ArraySchema',
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
        code: 'xgen-IPA-105-list-method-response-is-get-method-response',
        message:
          'The schema of each result in the List method response must be the same schema as the response of the Get method. http://go/ipa-spectral#IPA-105',
        path: ['paths', '/resource', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with exception',
    document: {
      paths: {
        // Using ref
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-105-list-method-response-is-get-method-response': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/PaginatedArraySchema',
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
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Inline schema
        '/arrayResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-105-list-method-response-is-get-method-response': 'reason',
                    },
                    schema: {
                      properties: {
                        results: {
                          type: 'array',
                          items: {
                            schema: {
                              $ref: '#/components/schemas/ResourceSchema',
                            },
                          },
                        },
                      },
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
      },
      components: componentSchemas,
    },
    errors: [],
  },
]);
