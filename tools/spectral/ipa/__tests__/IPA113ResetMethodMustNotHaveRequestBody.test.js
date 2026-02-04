import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-reset-method-must-not-have-request-body', [
  {
    name: 'valid reset method without request body',
    document: {
      paths: {
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
            responses: {
              200: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid reset method with request body',
    document: {
      paths: {
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
            responses: {
              200: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-reset-method-must-not-have-request-body',
        message: 'The :reset custom method must not have a request body.',
        path: ['paths', '/resource/{exampleId}/singleton:reset', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid reset with exception',
    document: {
      paths: {
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
            responses: {
              200: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-113-reset-method-must-not-have-request-body': 'exception reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
