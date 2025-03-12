import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-106-create-method-response-code-is-201', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/resource': {
          post: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}/subresource': {
          post: {
            responses: {
              201: {},
              400: {},
              500: {},
            },
          },
        },
        '/resource/{id}:customMethod': {
          post: {
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
        '/resourceOne': {
          post: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
          },
        },
        '/resourceTwo': {
          post: {
            responses: {
              400: {},
              500: {},
            },
          },
        },
        '/resourceThree': {
          post: {
            responses: {
              201: {},
              200: {},
              400: {},
              500: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-create-method-response-code-is-201',
        message:
          'The Create method must return a 201 Created response. This method either lacks a 201 Created response or defines a different 2xx status code. http://go/ipa/106',
        path: ['paths', '/resourceOne', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-response-code-is-201',
        message:
          'The Create method must return a 201 Created response. This method either lacks a 201 Created response or defines a different 2xx status code. http://go/ipa/106',
        path: ['paths', '/resourceTwo', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-response-code-is-201',
        message:
          'The Create method must return a 201 Created response. This method either lacks a 201 Created response or defines a different 2xx status code. http://go/ipa/106',
        path: ['paths', '/resourceThree', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/resourceOne': {
          post: {
            responses: {
              200: {},
              400: {},
              500: {},
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-106-create-method-response-code-is-201': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
