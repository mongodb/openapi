import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-113-singleton-must-not-have-delete-method', [
  {
    name: 'valid resources',
    document: {
      paths: {
        '/resource': {
          post: {},
          get: {},
        },
        '/resource/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/resource/{exampleId}/singleton': {
          get: {},
          patch: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid resource',
    document: {
      paths: {
        '/resource/{exampleId}/singleton': {
          delete: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-113-singleton-must-not-have-delete-method',
        message:
          'Singleton resources must not define the Delete standard method. If this is not a singleton resource, please implement all CRUDL methods.',
        path: ['paths', '/resource/{exampleId}/singleton'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid resources with exceptions',
    document: {
      paths: {
        '/resource/{exampleId}/singleton': {
          delete: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-113-singleton-must-not-have-delete-method': 'reason',
          },
        },
      },
    },
    errors: [],
  },
]);
