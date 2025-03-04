import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-get-method-response-code-is-200', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}': {
          get: {
            responses: {
              200: {},
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
        '/resourceOne/{id}': {
          get: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resourceTwo': { get: { responses: {} } },
        '/resourceTwo/{id}': {
          get: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resourceThree': { get: { responses: {} } },
        '/resourceThree/{id}': {
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
        code: 'xgen-IPA-104-get-method-response-code-is-200',
        message:
          'The Get method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code. http://go/ipa/104',
        path: ['paths', '/resourceOne/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-get-method-response-code-is-200',
        message:
          'The Get method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code. http://go/ipa/104',
        path: ['paths', '/resourceTwo/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-get-method-response-code-is-200',
        message:
          'The Get method must return a 200 OK response. This method either lacks a 200 OK response or defines a different 2xx status code. http://go/ipa/104',
        path: ['paths', '/resourceThree/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/resourceOne': { get: { responses: {} } },
        '/resourceOne/{id}': {
          get: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-104-get-method-response-code-is-200': 'reason',
            },
          },
        },
        '/resourceTwo': { get: { responses: {} } },
        '/resourceTwo/{id}': {
          get: {
            responses: {
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-104-get-method-response-code-is-200': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
