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
        message: 'DELETE method should return 204 No Content status code http://go/ipa/108',
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
]);
