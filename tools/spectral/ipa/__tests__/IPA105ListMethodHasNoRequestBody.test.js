import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-105-list-method-no-request-body', [
  {
    name: 'valid list without body',
    document: {
      paths: {
        '/resource': {
          get: {
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
    name: 'rule ignores singleton and Get',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {},
            },
          },
        },
        '/resource/{id}': {
          get: {
            responses: {
              200: {},
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  schema: { type: 'object' },
                },
              },
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
              200: {},
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  schema: { type: 'object' },
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
    name: 'invalid list with body',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {},
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  schema: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-105-list-method-no-request-body',
        message: 'The List method must not include a request body.',
        path: ['paths', '/resource', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid with exception',
    document: {
      paths: {
        '/resource': {
          get: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-105-list-method-no-request-body': 'reason',
            },
            responses: {
              200: {},
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  schema: { type: 'object' },
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
