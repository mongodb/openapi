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
  ResourcePaginatedList: {
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

testRule('xgen-IPA-110-collections-response-define-results-array', [
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
                      $ref: '#/components/schemas/ResourcePaginatedList',
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
        code: 'xgen-IPA-110-collections-response-define-results-array',
        message:
          'The response for collections must define an array of results containing the paginated resource. The response should reference a schema that contains "results" (array) field.',
        path: ['paths', '/resources', 'get', 'responses', '200', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid inline schema instead of reference',
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
    errors: [],
  },
]);
