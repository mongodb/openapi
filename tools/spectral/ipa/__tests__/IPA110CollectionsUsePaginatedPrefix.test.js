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
};

testRule('xgen-IPA-110-collections-use-paginated-prefix', [
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
        code: 'xgen-IPA-110-collections-use-paginated-prefix',
        message:
          'List methods response must reference a paginated response schema. The response should reference a schema with "Paginated" prefix.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Error,
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
                      $ref: '#/components/schemas/ResourceList',
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
        code: 'xgen-IPA-110-collections-use-paginated-prefix',
        message:
          'List methods response must reference a paginated response schema. The response should reference a schema with "Paginated" prefix.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-08-05+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-110-collections-use-paginated-prefix',
        message:
          'List methods response must reference a paginated response schema. The schema is defined inline and must reference a predefined paginated schema.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-01-01+json'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-110-collections-use-paginated-prefix',
        message:
          'List methods response must reference a paginated response schema. The List method response does not have a schema defined.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2024-03-03+json'],
        severity: DiagnosticSeverity.Error,
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
        code: 'xgen-IPA-110-collections-use-paginated-prefix',
        message: 'The schema is defined inline and must reference a predefined paginated schema.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Error,
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
                      'xgen-IPA-110-collections-use-paginated-prefix': 'Reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/ResourceList',
                    },
                  },
                  'application/vnd.atlas.2024-01-01+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-110-collections-use-paginated-prefix': 'Reason',
                    },
                    schema: {},
                  },
                  'application/vnd.atlas.2024-03-03+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-110-collections-use-paginated-prefix': 'Reason',
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
