import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const ERROR_MESSAGE =
  'Operations endpoints must not define custom methods. Control actions require mutating methods, which the read-only Operations resource does not allow.';

testRule('xgen-IPA-132-operations-endpoint-must-not-define-custom-methods', [
  {
    name: 'valid Operations endpoints without custom methods',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: {},
        },
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'custom methods on other resources are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}:customMethod': {
          post: {},
        },
        '/api/atlas/v2/resourceName:search': {
          post: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid custom method on the Operations collection',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations:purge': {
          post: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-endpoint-must-not-define-custom-methods',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/operations:purge'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid custom method on a single Operation',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}:cancel': {
          post: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-endpoint-must-not-define-custom-methods',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}:cancel'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid custom method on an instance-scoped Operations endpoint',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}:cancel': {
          post: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-endpoint-must-not-define-custom-methods',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}:cancel'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid custom methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}:cancel': {
          post: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-132-operations-endpoint-must-not-define-custom-methods': 'reason',
          },
        },
      },
    },
    errors: [],
  },
]);
