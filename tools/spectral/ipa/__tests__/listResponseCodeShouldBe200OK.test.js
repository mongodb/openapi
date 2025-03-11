import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-105-list-method-response-code-is-200', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}': {
          get: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}:customMethod': {
          get: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
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
        '/resourceOne': { get: { responses: {} } },
        '/resourceTwo': {
          get: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resourceThree': {
          get: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resourceFour': {
          get: {
            responses: {
              200: {},
              201: {},
              400: {},
              500: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-105-list-method-response-code-is-200',
        message:
          'The List method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code. http://go/ipa/105',
        path: ['paths', '/resourceOne', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-list-method-response-code-is-200',
        message:
          'The List method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code. http://go/ipa/105',
        path: ['paths', '/resourceTwo', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-list-method-response-code-is-200',
        message:
          'The List method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code. http://go/ipa/105',
        path: ['paths', '/resourceThree', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-105-list-method-response-code-is-200',
        message:
          'The List method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code. http://go/ipa/105',
        path: ['paths', '/resourceFour', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/resourceOne': {
          get: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-105-list-method-response-code-is-200': 'reason',
            },
            responses: {},
          },
        },
        '/resourceTwo': {
          get: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-105-list-method-response-code-is-200': 'reason',
            },
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resourceThree': {
          get: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-105-list-method-response-code-is-200': 'reason',
            },
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resourceFour': {
          get: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-105-list-method-response-code-is-200': 'reason',
            },
            responses: {
              200: {},
              201: {},
              400: {},
              500: {},
            },
          },
        },
      },
    },
    errors: [],
  },
]);
