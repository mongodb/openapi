import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-reset-method-must-return-200-OK', [
  {
    name: 'valid reset method with 200 OK and response body',
    document: {
      paths: {
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
              id: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid reset method with 201 instead of 200',
    document: {
      paths: {
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
            responses: {
              201: {
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
              id: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-reset-method-must-return-200-OK',
        message: 'The :reset custom method must return a 200 OK response with the reset resource in the response body.',
        path: ['paths', '/resource/{exampleId}/singleton:reset', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid reset method without response body',
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
    errors: [
      {
        code: 'xgen-IPA-113-reset-method-must-return-200-OK',
        message: 'The :reset custom method must return a 200 OK response with the reset resource in the response body.',
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
            responses: {
              201: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-113-reset-method-must-return-200-OK': 'exception reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
