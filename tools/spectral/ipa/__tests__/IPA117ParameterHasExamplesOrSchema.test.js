import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-parameter-has-examples-or-schema', [
  {
    name: 'valid parameters',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                example: '123',
              },
            ],
          },
        },
      },
      components: {
        parameters: {
          id: {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid parameters',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
              },
            ],
          },
        },
      },
      components: {
        parameters: {
          id: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-parameter-has-examples-or-schema',
        message: 'API producers must provide a well-defined schema or example(s) for parameters.',
        path: ['paths', '/resource/{id}', 'get', 'parameters', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-parameter-has-examples-or-schema',
        message: 'API producers must provide a well-defined schema or example(s) for parameters.',
        path: ['components', 'parameters', 'id'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid parameters with exceptions',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-parameter-has-examples-or-schema': 'reason',
                },
              },
            ],
          },
        },
      },
      components: {
        parameters: {
          id: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-parameter-has-examples-or-schema': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
