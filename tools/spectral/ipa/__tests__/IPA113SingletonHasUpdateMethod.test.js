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
    name: 'read-only singleton with referenced nested schema does not require update method',
    document: {
      paths: {
        '/resource/{exampleId}/readOnlySingleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ReadOnlySingleton',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          ReadOnlySingleton: {
            type: 'object',
            properties: {
              status: { type: 'string', readOnly: true },
              metadata: {
                $ref: '#/components/schemas/ReadOnlyMetadata',
              },
            },
          },
          ReadOnlyMetadata: {
            type: 'object',
            properties: {
              createdAt: { type: 'string', readOnly: true },
              updatedAt: { type: 'string', readOnly: true },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'singleton with writable property in referenced nested schema requires update method',
    document: {
      paths: {
        '/resource/{exampleId}/writableSingleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/WritableSingleton',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          WritableSingleton: {
            type: 'object',
            properties: {
              status: { type: 'string', readOnly: true },
              metadata: {
                $ref: '#/components/schemas/WritableMetadata',
              },
            },
          },
          WritableMetadata: {
            type: 'object',
            properties: {
              createdAt: { type: 'string', readOnly: true },
              displayName: { type: 'string' },
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
        path: ['paths', '/resource/{exampleId}/writableSingleton'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  ...['allOf', 'anyOf', 'oneOf'].flatMap((composition) =>
    [
      { description: 'read-only branches', withProperties: false, writable: false },
      { description: 'a writable branch', withProperties: false, writable: true },
      { description: 'read-only branches alongside properties', withProperties: true, writable: false },
      { description: 'a writable branch alongside read-only properties', withProperties: true, writable: true },
    ].map(({ description, withProperties, writable }) => ({
      name: `singleton with referenced nested ${composition} containing ${description}`,
      document: {
        paths: {
          '/resource/{exampleId}/singleton': {
            get: {
              responses: {
                200: {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Singleton' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Singleton: {
              type: 'object',
              properties: {
                metadata: { $ref: '#/components/schemas/Metadata' },
              },
            },
            Metadata: {
              ...(withProperties ? { properties: { id: { type: 'string', readOnly: true } } } : {}),
              [composition]: [
                { $ref: '#/components/schemas/ReadOnlyMetadataPart' },
                { $ref: '#/components/schemas/OtherMetadataPart' },
              ],
            },
            ReadOnlyMetadataPart: {
              type: 'object',
              properties: { createdAt: { type: 'string', readOnly: true } },
            },
            OtherMetadataPart: {
              type: 'object',
              properties: { displayName: { type: 'string', readOnly: !writable } },
            },
          },
        },
      },
      errors: writable
        ? [
            {
              code: 'xgen-IPA-113-singleton-should-have-update-method',
              message:
                'Singleton resources should define the Update method. If this is not a singleton resource, please implement all CRUDL methods.',
              path: ['paths', '/resource/{exampleId}/singleton'],
              severity: DiagnosticSeverity.Error,
            },
          ]
        : [],
    }))
  ),
  {
    name: 'list response shape does not prove singleton is read-only',
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
                          readOnly: true,
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', readOnly: true },
                              name: { type: 'string', readOnly: true },
                              status: { type: 'string', readOnly: true },
                            },
                          },
                        },
                        totalCount: { type: 'integer', readOnly: true },
                      },
                      required: ['results'],
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
        path: ['paths', '/resource/{exampleId}/readOnlyListSingleton'],
        severity: DiagnosticSeverity.Error,
      },
    ],
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
  {
    name: 'valid singleton with custom methods',
    document: {
      paths: {
        '/resource/{exampleId}/singleton': {
          get: {},
          patch: {},
        },
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
            responses: { 200: {} },
          },
        },
        '/resource/{exampleId}/singleton:customAction': {
          post: {
            operationId: 'customActionSingleton',
            responses: { 200: {} },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid singleton with custom methods but no update method',
    document: {
      paths: {
        '/resource/{exampleId}/singleton': {
          get: {},
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
        code: 'xgen-IPA-113-singleton-should-have-update-method',
        message:
          'Singleton resources should define the Update method. If this is not a singleton resource, please implement all CRUDL methods.',
        path: ['paths', '/resource/{exampleId}/singleton'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
