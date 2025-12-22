import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-106-readonly-resource-should-not-have-create-method', [
  {
    name: 'valid: writable resource with create method',
    document: {
      openapi: '3.0.0',
      paths: {
        '/writableResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', readOnly: true },
                        name: { type: 'string' }, // Not readOnly - writable resource
                        description: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/writableResource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', readOnly: true },
                        name: { type: 'string' },
                        description: { type: 'string' },
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
    errors: [],
  },
  {
    name: 'invalid: read-only resource with POST method',
    document: {
      openapi: '3.0.0',
      paths: {
        '/readOnlyResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', readOnly: true },
                        name: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/readOnlyResource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', readOnly: true },
                        name: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
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
    errors: [
      {
        code: 'xgen-IPA-106-readonly-resource-should-not-have-create-method',
        message: 'Read-only resources must not define the Create method.',
        path: ['paths', '/readOnlyResource', 'post'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid: read-only resource with create method and exception',
    document: {
      openapi: '3.0.0',
      paths: {
        '/readOnlyResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', readOnly: true },
                        name: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-106-readonly-resource-should-not-have-create-method': 'Special case exception',
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/readOnlyResource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', readOnly: true },
                        name: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
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
    errors: [],
  },
  {
    name: 'valid: resource without GET method should not error',
    document: {
      openapi: '3.0.0',
      paths: {
        '/resource': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
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
    errors: [],
  },
]);
