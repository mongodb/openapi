import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const lroExtension = { 'x-xgen-long-running-operation': { legacy: false } };
const legacyLroExtension = { 'x-xgen-long-running-operation': { legacy: true } };

const lroPost = {
  ...lroExtension,
  responses: {
    202: {
      headers: {
        Location: {
          schema: { type: 'string', format: 'uri' },
        },
      },
    },
  },
};

const operationsEndpoints = {
  '/api/atlas/v2/resourceName/operations': {
    get: {},
  },
  '/api/atlas/v2/resourceName/operations/{operationId}': {
    get: {},
  },
};

testRule('xgen-IPA-132-lros-must-expose-an-operations-endpoint', [
  {
    name: 'valid collection-level long-running operation with Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: lroPost,
        },
        ...operationsEndpoints,
      },
    },
    errors: [],
  },
  {
    name: 'valid instance-level long-running operation with instance Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          delete: lroPost,
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
    name: 'valid instance-level long-running operation with Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          delete: lroPost,
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
    name: 'invalid instance-level long-running operation with Operations endpoints only at the parent collection',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          delete: lroPost,
        },
        ...operationsEndpoints,
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lros-must-expose-an-operations-endpoint',
        message:
          'The long-running operation must expose an Operations endpoint: define /api/atlas/v2/resourceName/{pathParam}/operations and /api/atlas/v2/resourceName/{pathParam}/operations/{operationId}, each with a get method.',
        path: ['paths', '/api/atlas/v2/resourceName/{pathParam}', 'delete'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid custom method long-running operation with Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}:customMethod': {
          post: lroPost,
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
    name: 'valid untagged long-running operation with Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            responses: {
              202: {},
            },
          },
        },
        ...operationsEndpoints,
      },
    },
    errors: [],
  },
  {
    name: 'synchronous operations without a 202 response are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            responses: {
              201: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    // The merge step derives the extension from the 202 and removes it otherwise, so a
    // hand-authored extension without a 202 does not make an operation long-running
    name: 'operations tagged without a 202 response are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: {
              201: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'legacy long-running operations are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...legacyLroExtension,
            responses: {
              202: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'long-running operations on the shared legacy operationId list are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          delete: {
            operationId: 'deleteGroupCluster',
            responses: {
              202: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid untagged long-running operation without Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            responses: {
              202: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lros-must-expose-an-operations-endpoint',
        message:
          'The long-running operation must expose an Operations endpoint: define /api/atlas/v2/resourceName/operations and /api/atlas/v2/resourceName/operations/{operationId}, each with a get method.',
        path: ['paths', '/api/atlas/v2/resourceName', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid long-running operation without Operations endpoints',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: lroPost,
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lros-must-expose-an-operations-endpoint',
        message:
          'The long-running operation must expose an Operations endpoint: define /api/atlas/v2/resourceName/operations and /api/atlas/v2/resourceName/operations/{operationId}, each with a get method.',
        path: ['paths', '/api/atlas/v2/resourceName', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid long-running operation with an Operations collection that does not define get',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: lroPost,
        },
        '/api/atlas/v2/resourceName/operations': {
          post: {},
        },
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lros-must-expose-an-operations-endpoint',
        message:
          'The long-running operation must expose an Operations endpoint: define /api/atlas/v2/resourceName/operations and /api/atlas/v2/resourceName/operations/{operationId}, each with a get method.',
        path: ['paths', '/api/atlas/v2/resourceName', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid long-running operation with a single Operation endpoint that does not define get',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: lroPost,
        },
        '/api/atlas/v2/resourceName/operations': {
          get: {},
        },
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          delete: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lros-must-expose-an-operations-endpoint',
        message:
          'The long-running operation must expose an Operations endpoint: define /api/atlas/v2/resourceName/operations and /api/atlas/v2/resourceName/operations/{operationId}, each with a get method.',
        path: ['paths', '/api/atlas/v2/resourceName', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid long-running operation with only the Operations collection',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: lroPost,
        },
        '/api/atlas/v2/resourceName/operations': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lros-must-expose-an-operations-endpoint',
        message:
          'The long-running operation must expose an Operations endpoint: define /api/atlas/v2/resourceName/operations and /api/atlas/v2/resourceName/operations/{operationId}, each with a get method.',
        path: ['paths', '/api/atlas/v2/resourceName', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid long-running operations with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroPost,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-lros-must-expose-an-operations-endpoint': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'compliant long-running operations do not need an exception',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroPost,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-lros-must-expose-an-operations-endpoint': 'reason',
            },
          },
        },
        ...operationsEndpoints,
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lros-must-expose-an-operations-endpoint',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'post',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-lros-must-expose-an-operations-endpoint',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
