import testRule from './__helpers__/testRule.js';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-114-parameterized-paths-have-404-not-found', [
  {
    name: 'valid parameterized path with 404 response',
    document: {
      paths: {
        '/resources/{resourceId}': {
          get: {
            responses: {
              200: { description: 'Success' },
              404: { description: 'Not Found' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid parameterized path missing 404 response',
    document: {
      paths: {
        '/resources/{resourceId}': {
          get: {
            responses: {
              200: { description: 'Success' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-parameterized-paths-have-404-not-found',
        message: 'Parameterized path must define a 404 response.',
        path: ['paths', '/resources/{resourceId}', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'non-parameterized path without 404 response (valid)',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: { description: 'Success' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'parameterized path with multiple parameters and 404 response',
    document: {
      paths: {
        '/resources/{resourceId}/items/{itemId}': {
          get: {
            responses: {
              200: { description: 'Success' },
              404: { description: 'Not Found' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'no responses',
    document: {
      paths: {
        '/resources/{resourceId}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-parameterized-paths-have-404-not-found',
        message: 'Parameterized path must define a 404 response.',
        path: ['paths', '/resources/{resourceId}', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'with exception',
    document: {
      paths: {
        '/resources/{resourceId}': {
          get: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-114-parameterized-paths-have-404-not-found': 'Reason',
            },
            responses: {
              200: { description: 'Success' },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
