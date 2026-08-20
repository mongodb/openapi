import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const ERROR_MESSAGE =
  'The List method must not be a long-running operation. A List returns data from a collection that already exists on the server.';

const syncList = {
  responses: {
    200: {},
  },
};

const lroList = {
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

testRule('xgen-IPA-132-list-method-must-not-be-lro', [
  {
    name: 'valid synchronous List methods',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          get: syncList,
        },
      },
    },
    errors: [],
  },
  {
    name: 'methods that are not List methods are ignored',
    document: {
      paths: {
        // Get method, covered by xgen-IPA-132-get-method-must-not-be-lro
        '/api/atlas/v2/resourceName/{pathParam}': {
          get: lroList,
        },
        // Singleton resource Get method
        '/api/atlas/v2/resourceName/{pathParam}/settings': {
          get: lroList,
        },
        // Custom method
        '/api/atlas/v2/resourceName:customMethod': {
          get: lroList,
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid List method declaring a 202 response',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          get: lroList,
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-list-method-must-not-be-lro',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName', 'get', 'responses', '202'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid List method declaring a 202 response alongside a 200 response',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
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
        code: 'xgen-IPA-132-list-method-must-not-be-lro',
        message: ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName', 'get', 'responses', '202'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid List methods with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          get: {
            ...lroList,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-list-method-must-not-be-lro': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'compliant List method does not need an exception',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          get: {
            ...syncList,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-list-method-must-not-be-lro': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-list-method-must-not-be-lro',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'get',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-list-method-must-not-be-lro',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
