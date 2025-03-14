import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-107-put-method-response-code-is-200', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/resource/{id}': {
          put: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}/singleton': {
          put: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods',
    document: {
      paths: {
        '/resourceOne/{id}': {
          put: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resourceTwo/{id}': {
          put: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resourceThree/{id}': {
          put: {
            responses: {
              200: {},
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}/singleton': {
          put: {
            responses: {
              202: {},
              400: {},
              500: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-put-method-response-code-is-200',
        message:
          'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.',
        path: ['paths', '/resourceOne/{id}', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-put-method-response-code-is-200',
        message:
          'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.',
        path: ['paths', '/resourceTwo/{id}', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-put-method-response-code-is-200',
        message:
          'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.',
        path: ['paths', '/resourceThree/{id}', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-put-method-response-code-is-200',
        message:
          'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.',
        path: ['paths', '/resource/{id}/singleton', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/resourceOne/{id}': {
          put: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-put-method-response-code-is-200': 'reason',
            },
          },
        },
        '/resourceTwo/{id}': {
          put: {
            responses: {
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-put-method-response-code-is-200': 'reason',
            },
          },
        },
        '/resource/{id}/singleton': {
          put: {
            responses: {
              202: {},
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-put-method-response-code-is-200': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);

testRule('xgen-IPA-107-patch-method-response-code-is-200', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/resource/{id}': {
          patch: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}/singleton': {
          patch: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods',
    document: {
      paths: {
        '/resourceOne/{id}': {
          patch: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resourceTwo/{id}': {
          patch: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resourceThree/{id}': {
          patch: {
            responses: {
              200: {},
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}/singleton': {
          patch: {
            responses: {
              202: {},
              400: {},
              500: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-patch-method-response-code-is-200',
        message:
          'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.',
        path: ['paths', '/resourceOne/{id}', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-patch-method-response-code-is-200',
        message:
          'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.',
        path: ['paths', '/resourceTwo/{id}', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-patch-method-response-code-is-200',
        message:
          'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.',
        path: ['paths', '/resourceThree/{id}', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-patch-method-response-code-is-200',
        message:
          'The Update method response status code should be 200 OK. This method either lacks a 200 OK response or defines a different 2xx status code.',
        path: ['paths', '/resource/{id}/singleton', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/resourceOne/{id}': {
          patch: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-patch-method-response-code-is-200': 'reason',
            },
          },
        },
        '/resourceTwo/{id}': {
          patch: {
            responses: {
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-patch-method-response-code-is-200': 'reason',
            },
          },
        },
        '/resource/{id}/singleton': {
          patch: {
            responses: {
              202: {},
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-patch-method-response-code-is-200': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
