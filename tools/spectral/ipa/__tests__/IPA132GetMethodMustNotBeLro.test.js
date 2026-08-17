import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const ERROR_MESSAGE =
  'The Get method must not be a long-running operation. A Get returns the current state of a resource that already exists on the server.';

const syncGet = {
  responses: {
    200: {},
  },
};

const lroGet = {
  responses: {
    202: {
      description: 'Accepted',
      headers: {
        Location: {
          schema: { type: 'string', format: 'uri' },
        },
      },
    },
  },
};

testRule('xgen-IPA-132-get-method-must-not-be-lro', [
  {
    name: 'valid synchronous Get methods',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          get: syncGet,
        },
        // Singleton resource
        '/api/atlas/v2/resourceName/{pathParam}/settings': {
          get: syncGet,
        },
      },
    },
    errors: [],
  },
  {
    name: 'methods that are not Get methods are ignored',
    document: {
      paths: {
        // List method, covered by xgen-IPA-132-list-method-must-not-be-lro
        '/api/atlas/v2/resourceName': {
          get: lroGet,
        },
        // Custom method
        '/api/atlas/v2/resourceName/{pathParam}:customMethod': {
          get: lroGet,
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid Get method declaring a 202 response',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          get: lroGet,
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-get-method-must-not-be-lro',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/{pathParam}', 'get', 'responses', '202'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid singleton Get method declaring a 202 response',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}/settings': {
          get: lroGet,
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-get-method-must-not-be-lro',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/{pathParam}/settings', 'get', 'responses', '202'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Get method declaring a 202 response alongside a 200 response',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          get: {
            responses: {
              200: {},
              202: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-get-method-must-not-be-lro',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/{pathParam}', 'get', 'responses', '202'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Get methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          get: {
            ...lroGet,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-get-method-must-not-be-lro': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
