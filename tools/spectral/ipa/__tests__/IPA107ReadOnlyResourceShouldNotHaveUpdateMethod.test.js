import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-107-readonly-resource-should-not-have-update-method', [
  {
    name: 'valid: writable resource with update method',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
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
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
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
          patch: {
            requestBody: {
              content: {
                'application/json': {
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
              200: {
                content: {
                  'application/json': {
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
    name: 'invalid: read-only resource with PATCH method',
    document: {
      paths: {
        '/readOnlyResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
                        updatedAt: { type: 'string', readOnly: true },
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
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
                        updatedAt: { type: 'string', readOnly: true },
                      },
                    },
                  },
                },
              },
            },
          },
          patch: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
                        updatedAt: { type: 'string', readOnly: true },
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
        code: 'xgen-IPA-107-readonly-resource-should-not-have-update-method',
        message: 'Read-only resources must not define the Update method.',
        path: ['paths', '/readOnlyResource/{id}', 'patch'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid: read-only resource with PUT method',
    document: {
      paths: {
        '/readOnlyResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
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
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
                      },
                    },
                  },
                },
              },
            },
          },
          put: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
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
        code: 'xgen-IPA-107-readonly-resource-should-not-have-update-method',
        message: 'Read-only resources must not define the Update method.',
        path: ['paths', '/readOnlyResource/{id}', 'put'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid: read-only resource with update method and exception',
    document: {
      paths: {
        '/readOnlyResource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
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
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
                        createdAt: { type: 'string', readOnly: true },
                      },
                    },
                  },
                },
              },
            },
          },
          patch: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-readonly-resource-should-not-have-update-method': 'Special case exception',
            },
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', readOnly: true },
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
]);
