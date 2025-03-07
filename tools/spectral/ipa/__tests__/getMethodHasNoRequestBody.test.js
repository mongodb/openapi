import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-get-method-no-request-body', [
  {
    name: 'valid GET without body',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {},
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
              200: {},
            },
          },
        },
        '/resource/{id}:custom': {
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
    name: 'invalid GET with body',
    document: {
      paths: {
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
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  schema: { type: 'object' },
                },
              },
            },
            responses: {
              200: {},
            },
          },
        },
        '/resource/{id}:custom': {
          get: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
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
        code: 'xgen-IPA-104-get-method-no-request-body',
        message: 'The Get method request must not include a body. http://go/ipa/104',
        path: ['paths', '/resource/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-get-method-no-request-body',
        message: 'The Get method request must not include a body. http://go/ipa/104',
        path: ['paths', '/resource/{id}/singleton', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-get-method-no-request-body',
        message: 'The Get method request must not include a body. http://go/ipa/104',
        path: ['paths', '/resource/{id}:custom', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with exception',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-104-get-method-no-request-body': 'reason',
            },
            requestBody: {
              content: {
                'application/json': {
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
