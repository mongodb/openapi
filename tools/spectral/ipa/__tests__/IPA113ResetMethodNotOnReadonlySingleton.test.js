import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-reset-method-not-on-readonly-singleton', [
  {
    name: 'valid reset on writable singleton',
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
          post: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid reset on read-only singleton',
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
                        name: { type: 'string', readOnly: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{exampleId}/singleton:reset': {
          post: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-reset-method-not-on-readonly-singleton',
        message:
          'Read-only singleton resources must not define a :reset custom method. Read-only resources cannot be modified, so reset is not applicable.',
        path: ['paths', '/resource/{exampleId}/singleton:reset'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid reset with exception',
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
                        name: { type: 'string', readOnly: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{exampleId}/singleton:reset': {
          post: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-113-reset-method-not-on-readonly-singleton': 'exception reason',
          },
        },
      },
    },
    errors: [],
  },
]);
