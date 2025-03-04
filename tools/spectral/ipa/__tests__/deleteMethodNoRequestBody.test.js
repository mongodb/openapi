import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-108-delete-request-no-body', [
  {
    name: 'valid DELETE without body',
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
    errors: [],
  },
  {
    name: 'invalid DELETE with body',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-08-05+json': {
                  schema: { type: 'object' },
                },
              },
            },
            responses: {
              204: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-108-delete-request-no-body',
        message: 'DELETE method should not have a request body http://go/ipa/108',
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
              'xgen-IPA-108-delete-request-no-body': 'Bulk delete operation',
            },
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
