import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-GET-response-code-should-be-200-OK', [
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
              200: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}:customMethod': {
          get: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
          },
        },
        '/singleton': {
          get: {
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
        '/resource1/{id}': {
          get: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource2/{id}': {
          get: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-GET-response-code-should-be-200-OK',
        message: 'The HTTP response status code for GET operations should be 200 OK. http://go/ipa/104',
        path: ['paths', '/resource1/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-GET-response-code-should-be-200-OK',
        message: 'The HTTP response status code for GET operations should be 200 OK. http://go/ipa/104',
        path: ['paths', '/resource2/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/resource1/{id}': {
          get: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-104-GET-response-code-should-be-200-OK': 'reason',
            },
          },
        },
        '/resource2/{id}': {
          get: {
            responses: {
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-104-GET-response-code-should-be-200-OK': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
