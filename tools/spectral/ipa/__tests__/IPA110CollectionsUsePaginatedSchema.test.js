import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  Resource: {
    type: 'object',
  },
  PaginatedResourceList: {
    type: 'object',
    properties: {
      totalCount: {
        type: 'integer',
      },
      results: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Resource',
        },
      },
    },
  },
  ResourceList: {
    type: 'object',
    properties: {
      totalCount: {
        type: 'integer',
      },
      results: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Resource',
        },
      },
    },
  },
  NonPaginatedList: {
    type: 'object',
    properties: {
      count: {
        type: 'integer',
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Resource',
        },
      },
    },
  },
};

testRule('xgen-IPA-110-collections-use-paginated-schema', [
  {
    name: 'valid schemas with Paginated prefix',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedResourceList',
                    },
                  },
                },
              },
            },
          },
        },
        '/resources/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Resource',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: componentSchemas,
      },
    },
    errors: [],
  },
  {
    name: 'valid schemas without Paginated prefix but with correct structure',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceList',
                    },
                  },
                },
              },
            },
          },
        },
        '/resources/{id}': {
          get: {},
        },
      },
      components: {
        schemas: componentSchemas,
      },
    },
    errors: [],
  },
  {
    name: 'invalid list methods without correct structure',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/NonPaginatedList',
                    },
                  },
                },
              },
            },
          },
        },
        '/resources/{id}': {
          get: {},
        },
      },
      components: {
        schemas: componentSchemas,
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-use-paginated-schema',
        message:
          'List methods must use a paginated response schema. The response should reference a schema with either a name starting with "Paginated" or contain both "totalCount" (integer) and "results" (array) fields.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid schema missing totalCount',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/MissingTotalCount',
                    },
                  },
                },
              },
            },
          },
        },
        '/resources/{id}': {
          get: {},
        },
      },
      components: {
        schemas: {
          ...componentSchemas,
          MissingTotalCount: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Resource',
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-use-paginated-schema',
        message:
          'List methods must use a paginated response schema. The response should reference a schema with either a name starting with "Paginated" or contain both "totalCount" (integer) and "results" (array) fields.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid schema missing results',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/MissingResults',
                    },
                  },
                },
              },
            },
          },
        },
        '/resources/{id}': {
          get: {},
        },
      },
      components: {
        schemas: {
          MissingResults: {
            type: 'object',
            properties: {
              totalCount: {
                type: 'integer',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-use-paginated-schema',
        message:
          'List methods must use a paginated response schema. The response should reference a schema with either a name starting with "Paginated" or contain both "totalCount" (integer) and "results" (array) fields.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'inline schema instead of reference',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        totalCount: {
                          type: 'integer',
                        },
                        results: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Resource',
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
        '/resources/{id}': {
          get: {},
        },
      },
      components: {
        schemas: componentSchemas,
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-use-paginated-schema',
        message:
          'The schema is defined inline and must reference a predefined schema with a name starting with "Paginated".',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid schema with exception',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-110-collections-use-paginated-schema': 'Reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/NonPaginatedList',
                    },
                  },
                },
              },
            },
          },
        },
        '/resources/{id}': {
          get: {},
        },
      },
      components: {
        schemas: componentSchemas,
      },
    },
    errors: [],
  },
]);
