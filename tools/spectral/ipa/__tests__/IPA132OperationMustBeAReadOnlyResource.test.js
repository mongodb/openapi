import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const READ_ONLY_SCHEMA_ERROR_MESSAGE =
  'The Operation resource must be read-only. All properties of the GET response schema must be marked as readOnly: true.';

const readOnlyGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: {
            properties: {
              id: { readOnly: true },
              status: { readOnly: true },
            },
          },
        },
      },
    },
  },
};

const nonReadOnlyGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: {
            properties: {
              id: { readOnly: true },
              status: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

const readOnlyOperationsEndpoint = { get: readOnlyGet };
const nonReadOnlyOperationsEndpoint = { get: nonReadOnlyGet };

testRule('xgen-IPA-132-operation-must-be-a-read-only-resource', [
  {
    name: 'valid read-only Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': readOnlyOperationsEndpoint,
        '/api/atlas/v2/resourceName/operations/{operationId}': readOnlyOperationsEndpoint,
        '/api/atlas/v2/resourceName/{pathParam}/operations': readOnlyOperationsEndpoint,
        '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}': readOnlyOperationsEndpoint,
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
    name: 'invalid Operations endpoints with methods other than get',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          ...readOnlyOperationsEndpoint,
          post: {},
        },
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          ...readOnlyOperationsEndpoint,
          put: {},
          patch: {},
          delete: {},
          head: {},
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
      {
        code: 'xgen-IPA-132-operation-must-be-a-read-only-resource',
        message: 'Operations endpoints are read-only and do not allow the head method.',
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}', 'head'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations endpoint with a declared but empty method',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          ...readOnlyOperationsEndpoint,
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
    name: 'invalid single Operation endpoint with properties that are not readOnly',
    document: {
      paths: {
        // The List method on the collection reuses the Operation resource schema, so only the
        // single Operation endpoint, where the Get method is defined, is checked
        '/api/atlas/v2/resourceName/operations': nonReadOnlyOperationsEndpoint,
        '/api/atlas/v2/resourceName/operations/{operationId}': nonReadOnlyOperationsEndpoint,
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-must-be-a-read-only-resource',
        message: READ_ONLY_SCHEMA_ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations endpoints with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          ...readOnlyOperationsEndpoint,
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
          ...readOnlyOperationsEndpoint,
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
