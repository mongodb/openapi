import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-singleton-must-not-have-id', [
  {
    name: 'valid resources',
    document: {
      paths: {
        '/standard': {
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
        '/standard/{exampleId}': {
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
        '/singleton1': {
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
        '/singleton2': {
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
        '/singleton1': {
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
        '/singleton2': {
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
        '/singleton3': {
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
        path: ['paths', '/singleton1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-113-singleton-must-not-have-id',
        message: 'Singleton resources must not have a user-provided or system-generated ID. http://go/ipa/113',
        path: ['paths', '/singleton2'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-113-singleton-must-not-have-id',
        message: 'Singleton resources must not have a user-provided or system-generated ID. http://go/ipa/113',
        path: ['paths', '/singleton3'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid resources with exceptions',
    document: {
      paths: {
        '/singleton1': {
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
