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
        '/resource/{exampleId}/singleton1': {
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
        '/resource/{exampleId}/singleton2': {
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
        message: 'Singleton resources must not have a user-provided or system-generated ID. http://go/ipa/113',
        path: ['paths', '/resource/{exampleId}/singletonOne'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-113-singleton-must-not-have-id',
        message: 'Singleton resources must not have a user-provided or system-generated ID. http://go/ipa/113',
        path: ['paths', '/resource/{exampleId}/singletonTwo'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-113-singleton-must-not-have-id',
        message: 'Singleton resources must not have a user-provided or system-generated ID. http://go/ipa/113',
        path: ['paths', '/resource/{exampleId}/singletonThree'],
        severity: DiagnosticSeverity.Warning,
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
]);
