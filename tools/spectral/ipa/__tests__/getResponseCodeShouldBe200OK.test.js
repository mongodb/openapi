import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-GET-response-code-should-be-200-OK', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/path1/{resource}': {
          get: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
          },
        },
        '/path2/{resource}': {
          get: {
            responses: {
              200: {},
              401: {},
              404: {},
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
        '/path1/{resource}': {
          get: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/path2/{resource}': {
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
        path: ['paths', '/path1/{resource}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-GET-response-code-should-be-200-OK',
        message: 'The HTTP response status code for GET operations should be 200 OK. http://go/ipa/104',
        path: ['paths', '/path2/{resource}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/path1/{resource}': {
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
        '/path2/{resource}': {
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
