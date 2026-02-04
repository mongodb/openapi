import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-reset-method-must-use-POST', [
  {
    name: 'valid reset method with POST',
    document: {
      paths: {
        '/resource/{exampleId}/singleton': {
          get: {},
          patch: {},
        },
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
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
              name: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid reset method with GET',
    document: {
      paths: {
        '/resource/{exampleId}/singleton:reset': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-reset-method-must-use-POST',
        message: 'The :reset custom method must use the POST HTTP method.',
        path: ['paths', '/resource/{exampleId}/singleton:reset'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid reset method with multiple methods',
    document: {
      paths: {
        '/resource/{exampleId}/singleton:reset': {
          get: {},
          post: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-reset-method-must-use-POST',
        message: 'The :reset custom method must use the POST HTTP method.',
        path: ['paths', '/resource/{exampleId}/singleton:reset'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid reset with exception',
    document: {
      paths: {
        '/resource/{exampleId}/singleton:reset': {
          get: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-113-reset-method-must-use-POST': 'exception reason',
          },
        },
      },
    },
    errors: [],
  },
]);
