import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-reset-method-only-on-singleton-resources', [
  {
    name: 'valid reset on singleton resource',
    document: {
      paths: {
        '/resource/{exampleId}/singleton': {
          get: {},
          patch: {},
        },
        '/resource/{exampleId}/singleton:reset': {
          post: {
            operationId: 'resetSingleton',
            responses: { 200: {} },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid reset on non-singleton resource',
    document: {
      paths: {
        '/resource': {
          get: {},
          post: {},
        },
        '/resource:reset': {
          post: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-reset-method-only-on-singleton-resources',
        message:
          'The :reset custom method must only be defined on singleton resources.',
        path: ['paths', '/resource:reset'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid reset with exception',
    document: {
      paths: {
        '/resource': {
          get: {},
          post: {},
        },
        '/resource:reset': {
          post: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-113-reset-method-only-on-singleton-resources': 'exception reason',
          },
        },
      },
    },
    errors: [],
  },
]);
