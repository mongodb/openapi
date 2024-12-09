import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-resource-has-GET', [
  {
    name: 'valid standard method',
    document: {
      paths: {
        '/example': {
          post: {},
          get: {},
        },
        '/example/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid standard method',
    document: {
      paths: {
        '/example': {
          post: {},
          get: {},
        },
        '/example/{exampleId}': {
          patch: {},
          delete: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources. http://go/ipa/117',
        path: ['paths', '/example'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
