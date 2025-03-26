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
      links: {
        type: 'array',
      },
    },
  },
};

testRule('xgen-IPA-110-collections-response-define-links-array', [
  {
    name: 'valid schema',
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
    name: 'invalid schema missing links',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedMissingLinks',
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
          PaginatedMissingLinks: {
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
        code: 'xgen-IPA-110-collections-response-define-links-array',
        message:
          'The response for collections should define a links array field, providing links to next and previous pages.',
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
                        links: {
                          type: 'array',
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
  {
    name: 'invalid schema missing results with exceptions',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/PaginatedMissingLinks',
                    },
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-110-collections-response-define-links-array': 'Reason',
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
          PaginatedMissingLinks: {
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
    errors: [],
  },
]);
