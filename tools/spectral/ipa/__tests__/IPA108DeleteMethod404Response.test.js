import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-108-delete-include-404-response', [
  {
    name: 'valid DELETE with 404',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            responses: {
              204: {},
              404: {
                description: 'Resource not found',
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
          delete: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-delete-include-404-response',
        message: 'DELETE method should include 404 status code for not found resources.',
        path: ['paths', '/resource/{id}', 'delete'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid empty responses',
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
        code: 'xgen-IPA-108-delete-include-404-response',
        message: 'DELETE method should include 404 status code for not found resources.',
        path: ['paths', '/resource/{id}', 'delete'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid DELETE missing 404',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            responses: {
              204: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-delete-include-404-response',
        message: 'DELETE method should include 404 status code for not found resources.',
        path: ['paths', '/resource/{id}', 'delete'],
        severity: DiagnosticSeverity.Warning,
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
              'xgen-IPA-108-delete-include-404-response': 'Idempotent delete',
            },
            responses: {
              204: {},
            },
          },
        },
      },
    },
    errors: [],
  },
]);
