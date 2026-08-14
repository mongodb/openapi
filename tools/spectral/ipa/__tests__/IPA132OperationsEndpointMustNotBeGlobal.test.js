import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const ERROR_MESSAGE =
  'Operations endpoints must not be standalone, global endpoints with no parent resource in their path.';

testRule('xgen-IPA-132-operations-endpoint-must-not-be-global', [
  {
    name: 'valid nested Operations endpoints',
    document: {
      paths: {
        // Collection-scoped Operations endpoints, nested directly under the parent collection
        '/api/atlas/v2/resourceName/operations': {},
        '/api/atlas/v2/resourceName/operations/{operationId}': {},
        '/api/atlas/v2/resourceName1/{pathParam}/resourceName2/operations': {},
        '/api/atlas/v2/resourceName1/{pathParam}/resourceName2/operations/{operationId}': {},
        '/api/atlas/v2/unauth/resourceName/operations': {},
        '/api/atlas/v2/unauth/resourceName/operations/{operationId}': {},
        // Instance-scoped Operations endpoints, nested under the parent resource instance
        '/api/atlas/v2/resourceName/{pathParam}/operations': {},
        '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}': {},
      },
    },
    errors: [],
  },
  {
    name: 'paths that are not Operations endpoints are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {},
        '/api/atlas/v2/resourceName/{pathParam}': {},
        // Not a well-formed Operations endpoint, covered by xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource
        '/api/atlas/v2/resourceName/operations/subresource': {},
      },
    },
    errors: [],
  },
  {
    name: 'invalid root-level Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/operations': {},
        '/api/atlas/v2/operations/{operationId}': {},
        '/api/atlas/v2/unauth/operations': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-endpoint-must-not-be-global',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/operations'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operations-endpoint-must-not-be-global',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/operations/{operationId}'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operations-endpoint-must-not-be-global',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/unauth/operations'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'null path items are still validated',
    document: {
      paths: {
        '/api/atlas/v2/operations': null,
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-endpoint-must-not-be-global',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/operations'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid root-level Operations endpoints with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/operations': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-132-operations-endpoint-must-not-be-global': 'reason',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'nested Operations endpoints do not need an exception',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-132-operations-endpoint-must-not-be-global': 'reason',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-endpoint-must-not-be-global',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operations-endpoint-must-not-be-global',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
