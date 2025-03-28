import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-108-delete-method-return-204-response', [
  {
    name: 'valid DELETE with 204',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            responses: {
              204: {
                description: 'Resource deleted',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid DELETE with no responses',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            responses: {},
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-delete-method-return-204-response',
        message: 'DELETE method should return 204 No Content status code.',
        path: ['paths', '/resource/{id}', 'delete'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid DELETE with no responses',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-delete-method-return-204-response',
        message: 'DELETE method should return 204 No Content status code.',
        path: ['paths', '/resource/{id}', 'delete'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid DELETE missing 204',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            responses: {
              200: {
                description: 'Resource deleted',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-delete-method-return-204-response',
        message: 'DELETE method should return 204 No Content status code.',
        path: ['paths', '/resource/{id}', 'delete'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid with exception',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-108-delete-method-return-204-response': 'Legacy API',
            },
            responses: {
              200: {
                description: 'Resource deleted',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'skipped for collection endpoint (no path parameter)',
    document: {
      paths: {
        '/resources': {
          delete: {
            responses: {
              200: {
                description: 'Resource deleted',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'applied for single resource endpoint (with path parameter)',
    document: {
      paths: {
        '/resources/{resourceId}': {
          delete: {
            responses: {
              200: {
                description: 'Resource deleted',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-delete-method-return-204-response',
        message: 'DELETE method should return 204 No Content status code.',
        path: ['paths', '/resources/{resourceId}', 'delete'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
