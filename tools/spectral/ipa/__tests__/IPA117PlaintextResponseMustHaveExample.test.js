import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-plaintext-response-must-have-example', [
  {
    name: 'valid responses',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+csv': {
                    example: 'test',
                    schema: {},
                  },
                  'text/plain': {
                    schema: {
                      example: 'test',
                      type: 'string',
                    },
                  },
                },
              },
              // Ignores non-2xx
              400: {
                content: {
                  'text/plain': {
                    schema: {},
                  },
                },
              },
            },
          },
        },
        // Ignores JSON/YAML/gzip
        '/resourceTwo': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    type: 'string',
                  },
                  'application/vnd.atlas.2024-08-05+yaml': {
                    type: 'string',
                  },
                  'application/vnd.atlas.2024-08-05+gzip': {
                    type: 'string',
                    format: 'binary',
                  },
                  'application/vnd.atlas.2023-08-05+gzip': {
                    schema: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid resources',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2022-01-01+csv': {
                    schema: {},
                  },
                  'application/vnd.atlas.2023-01-01+csv': {
                    schema: {},
                  },
                  'text/plain': {
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-plaintext-response-must-have-example',
        message: 'For APIs that respond with plain text, for example CSV, API producers must provide an example.',
        path: ['paths', '/resource', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2022-01-01+csv'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-plaintext-response-must-have-example',
        message: 'For APIs that respond with plain text, for example CSV, API producers must provide an example.',
        path: ['paths', '/resource', 'get', 'responses', '200', 'content', 'application/vnd.atlas.2023-01-01+csv'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-plaintext-response-must-have-example',
        message: 'For APIs that respond with plain text, for example CSV, API producers must provide an example.',
        path: ['paths', '/resource', 'get', 'responses', '200', 'content', 'text/plain'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid resources with exceptions',
    document: {
      paths: {
        '/resource': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2022-01-01+csv': {
                    schema: {},
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-117-plaintext-response-must-have-example': 'reason',
                    },
                  },
                  'application/vnd.atlas.2023-01-01+csv': {
                    schema: {},
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-117-plaintext-response-must-have-example': 'reason',
                    },
                  },
                  'text/plain': {
                    schema: {
                      type: 'string',
                    },
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-117-plaintext-response-must-have-example': 'reason',
                    },
                  },
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
