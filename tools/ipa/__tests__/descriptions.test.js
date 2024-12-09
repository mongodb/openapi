import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-description', [
  {
    name: 'valid standard method',
    document: {
      paths: {
        '/example': {
          get: {
            description: 'Test',
          },
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
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-description',
        message: 'Property must have a description.',
        path: ['paths', '/example', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
