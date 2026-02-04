import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-singleton-must-not-have-id', [
  {
    name: 'valid resources',
    document: {
      paths: {
        '/resource': {
          post: {},
          get: {
            responses: {
              200: {
                content: {
                  version1: {
                    schema: {
                      properties: {
                        id: {},
                        someProperty: {},
                      },
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{exampleId}': {
          get: {
            responses: {
              200: {
                content: {
                  version1: {
                    schema: {
                      properties: {
                        id: {},
                        someProperty: {},
                      },
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
          patch: {},
          delete: {},
        },
        '/resource/{exampleId}/singletonOne': {
          get: {
            responses: {
              200: {
                content: {
                  version1: {
                    schema: {
                      properties: {
                        someProperty: {},
                      },
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{exampleId}/singletonTwo': {
          get: {
            responses: {
              200: {
                content: {
                  version1: {
                    schema: {
                      properties: {
                        someId: {},
                        someProperty: {},
                      },
                      type: 'object',
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
    name: 'invalid resources',
    document: {
      paths: {
        '/resource/{exampleId}/singletonOne': {
          get: {
            responses: {
              200: {
                content: {
                  version1: {
                    schema: {
                      properties: {
                        id: {},
                        someProperty: {},
                      },
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{exampleId}/singletonTwo': {
          get: {
            responses: {
              200: {
                content: {
                  version1: {
                    schema: {
                      properties: {
                        _id: {},
                        someProperty: {},
                      },
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{exampleId}/singletonThree': {
          get: {
            responses: {
              200: {
                content: {
                  version1: {
                    schema: {
                      properties: {
                        someId: {},
                        someProperty: {},
                      },
                      type: 'object',
                    },
                  },
                  version2: {
                    schema: {
                      properties: {
                        id: {},
                        someProperty: {},
                      },
                      type: 'object',
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
        code: 'xgen-IPA-113-singleton-must-not-have-id',
        message: 'Singleton resources must not have a user-provided or system-generated ID.',
        path: ['paths', '/resource/{exampleId}/singletonOne'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-113-singleton-must-not-have-id',
        message: 'Singleton resources must not have a user-provided or system-generated ID.',
        path: ['paths', '/resource/{exampleId}/singletonTwo'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-113-singleton-must-not-have-id',
        message: 'Singleton resources must not have a user-provided or system-generated ID.',
        path: ['paths', '/resource/{exampleId}/singletonThree'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid resources with exceptions',
    document: {
      paths: {
        '/resource/{exampleId}/singletonOne': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-113-singleton-must-not-have-id': 'reason',
          },
          get: {
            responses: {
              200: {
                content: {
                  version1: {
                    schema: {
                      properties: {
                        id: {},
                        someProperty: {},
                      },
                      type: 'object',
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
    name: 'valid singleton with custom methods and no id',
    document: {
      paths: {
        '/resource/{exampleId}/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        status: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          patch: {},
        },
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
            responses: { 200: {} },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid singleton with custom methods but has id',
    document: {
      paths: {
        '/resource/{exampleId}/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
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
          patch: {},
        },
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
            responses: { 200: {} },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-singleton-must-not-have-id',
        message:
          'Singleton resources must not have a user-provided or system-generated ID.',
        path: ['paths', '/resource/{exampleId}/singleton'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
