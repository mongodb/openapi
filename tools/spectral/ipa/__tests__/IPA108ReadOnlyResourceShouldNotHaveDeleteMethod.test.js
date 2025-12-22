import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-108-readonly-resource-should-not-have-delete-method', [
  {
    name: 'valid: writable resource with delete method',
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
          delete: {
            responses: {
              204: {
                description: 'No Content',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid: read-only resource with DELETE method',
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
          delete: {
            responses: {
              204: {
                description: 'No Content',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-readonly-resource-should-not-have-delete-method',
        message: 'Read-only resources must not define the Delete method.',
        path: ['paths', '/readOnlyResource/{id}', 'delete'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid: read-only resource with delete method and exception',
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
          delete: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-108-readonly-resource-should-not-have-delete-method': 'Special case exception',
            },
            responses: {
              204: {
                description: 'No Content',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid: read-only singleton resource with DELETE method',
    document: {
      openapi: '3.0.0',
      paths: {
        '/parent/{parentId}/readOnlySingleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
                        lastUpdated: { type: 'string', readOnly: true },
                      },
                    },
                  },
                },
              },
            },
          },
          delete: {
            responses: {
              204: {
                description: 'No Content',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-readonly-resource-should-not-have-delete-method',
        message: 'Read-only resources must not define the Delete method.',
        path: ['paths', '/parent/{parentId}/readOnlySingleton', 'delete'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid: resource without GET method should not error',
    document: {
      openapi: '3.0.0',
      paths: {
        '/resource/{id}': {
          delete: {
            responses: {
              204: {
                description: 'No Content',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
