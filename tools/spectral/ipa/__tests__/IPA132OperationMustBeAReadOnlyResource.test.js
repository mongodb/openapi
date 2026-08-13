import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-132-operation-must-be-a-read-only-resource', [
  {
    name: 'valid read-only Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: {},
        },
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: {},
        },
        '/api/atlas/v2/resourceName/{pathParam}/operations': {
          get: {},
        },
        '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}': {
          get: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'paths that are not Operations endpoints are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {},
        },
        '/api/atlas/v2/resourceName/{pathParam}': {
          put: {},
          patch: {},
          delete: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid Operations endpoints with mutating methods',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: {},
          post: {},
        },
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: {},
          put: {},
          patch: {},
          delete: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-must-be-a-read-only-resource',
        message: 'Operations endpoints are read-only and do not allow the post method.',
        path: ['paths', '/api/atlas/v2/resourceName/operations', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-must-be-a-read-only-resource',
        message: 'Operations endpoints are read-only and do not allow the put method.',
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-must-be-a-read-only-resource',
        message: 'Operations endpoints are read-only and do not allow the patch method.',
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-must-be-a-read-only-resource',
        message: 'Operations endpoints are read-only and do not allow the delete method.',
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}', 'delete'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations endpoint with a declared but empty method',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: {},
          post: null,
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-must-be-a-read-only-resource',
        message: 'Operations endpoints are read-only and do not allow the post method.',
        path: ['paths', '/api/atlas/v2/resourceName/operations', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations endpoints with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: {},
          post: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-132-operation-must-be-a-read-only-resource': 'reason',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'read-only Operations endpoints do not need an exception',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-132-operation-must-be-a-read-only-resource': 'reason',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-must-be-a-read-only-resource',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-must-be-a-read-only-resource',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
