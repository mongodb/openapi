import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const ERROR_MESSAGE =
  'Operations endpoints must be leaf resources. An `operations` segment may only be followed by a single operation identifier path parameter.';

testRule('xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource', [
  {
    name: 'valid leaf Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {},
        '/api/atlas/v2/resourceName/operations/{operationId}': {},
        '/api/atlas/v2/resourceName/{pathParam}/operations': {},
        '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}': {},
        // Root-level Operations endpoints are leaves, their nesting is covered by
        // xgen-IPA-132-operations-endpoint-must-not-be-global
        '/api/atlas/v2/operations': {},
      },
    },
    errors: [],
  },
  {
    name: 'paths without an operations segment are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {},
        '/api/atlas/v2/resourceName/{pathParam}': {},
        '/api/atlas/v2/resourceName/{pathParam}/childResource': {},
      },
    },
    errors: [],
  },
  {
    name: 'invalid paths nested below Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/subresource': {},
        '/api/atlas/v2/resourceName/operations/{operationId}/subresource': {},
        '/api/atlas/v2/resourceName/operations/{operationId}/{anotherId}': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/operations/subresource'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}/subresource'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}/{anotherId}'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid paths with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}/subresource': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource': 'reason',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'leaf Operations endpoints do not need an exception',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource': 'reason',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations/{operationId}',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operations-endpoint-must-be-a-leaf-resource',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
