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
  PaginatedList: {
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
    name: 'invalid schemas without Paginated prefix but with correct structure',
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
    errors: [
      {
        code: 'xgen-IPA-110-collections-use-paginated-schema',
        message:
          'List methods response must reference a paginated response schema. The response should reference a schema with "Paginated" prefix',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
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
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedList',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {},
                  },
                  'application/vnd.atlas.2024-03-03+json': {},
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
          'List methods response must reference a paginated response schema. The response should reference a schema that contains both "totalCount" (integer) and "results" (array) fields.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-110-collections-use-paginated-schema',
        message:
          'List methods response must reference a paginated response schema. The schema is defined inline and must reference a predefined paginated schema.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-110-collections-use-paginated-schema',
        message:
          'List methods response must reference a paginated response schema. The List method response does not have a schema defined.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-03-03+json'],
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
                      $ref: '#/components/schemas/PaginatedMissingTotalCount',
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
          PaginatedMissingTotalCount: {
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
          'List methods response must reference a paginated response schema. The response should reference a schema that contains both "totalCount" (integer) and "results" (array) fields.',
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
                      $ref: '#/components/schemas/PaginatedMissingResults',
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
          PaginatedMissingResults: {
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
          'List methods response must reference a paginated response schema. The response should reference a schema that contains both "totalCount" (integer) and "results" (array) fields.',
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
        message: 'The schema is defined inline and must reference a predefined paginated schema.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid schema with exception',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-110-collections-use-paginated-schema': 'Reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/PaginatedList',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-110-collections-use-paginated-schema': 'Reason',
                    },
                    schema: {},
                  },
                  'application/vnd.atlas.2024-03-03+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-110-collections-use-paginated-schema': 'Reason',
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
