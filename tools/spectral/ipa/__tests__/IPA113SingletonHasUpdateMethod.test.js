import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-singleton-should-have-update-method', [
  {
    name: 'valid resources',
    document: {
      paths: {
        '/resource/{exampleId}/singletonOne': {
          patch: {},
        },
        '/resource/{exampleId}/singletonTwo': {
          put: {},
        },
        '/resource/{exampleId}/singletonThree': {
          patch: {},
          put: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid resource',
    document: {
      paths: {
        '/resource/{exampleId}/singletonOne': {
          get: {},
        },
        '/resource/{exampleId}/singletonTwo': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-singleton-should-have-update-method',
        message:
          'Singleton resources should define the Update method. If this is not a singleton resource, please implement all CRUDL methods.',
        path: ['paths', '/resource/{exampleId}/singletonOne'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-113-singleton-should-have-update-method',
        message:
          'Singleton resources should define the Update method. If this is not a singleton resource, please implement all CRUDL methods.',
        path: ['paths', '/resource/{exampleId}/singletonTwo'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid resources with exceptions',
    document: {
      paths: {
        '/resource/{exampleId}/singletonOne': {
          get: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-113-singleton-should-have-update-method': 'reason',
          },
        },
        '/resource/{exampleId}/singletonTwo': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-113-singleton-should-have-update-method': 'reason',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'read-only singleton resources do not require update method',
    document: {
      paths: {
        '/resource/{exampleId}/readOnlySingleton': {
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
      },
    },
    errors: [],
  },
  {
    name: 'read-only singleton with List response',
    document: {
      paths: {
        '/resource/{exampleId}/readOnlyListSingleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        results: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', readOnly: true },
                              name: { type: 'string', readOnly: true },
                              status: { type: 'string', readOnly: true },
                            },
                          },
                        },
                        totalCount: { type: 'integer' },
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
    name: 'writable singleton with List response',
    document: {
      paths: {
        '/resource/{exampleId}/listSingleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        results: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', readOnly: true },
                              name: { type: 'string' },
                              description: { type: 'string' },
                            },
                          },
                        },
                        totalCount: { type: 'integer' },
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
        code: 'xgen-IPA-113-singleton-should-have-update-method',
        message:
          'Singleton resources should define the Update method. If this is not a singleton resource, please implement all CRUDL methods.',
        path: ['paths', '/resource/{exampleId}/listSingleton'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
