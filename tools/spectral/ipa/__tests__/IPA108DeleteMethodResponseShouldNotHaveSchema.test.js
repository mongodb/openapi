import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-108-delete-response-should-be-empty', [
  {
    name: 'valid DELETE with void 204',
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
    name: 'valid DELETE with void 204 versioned',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            responses: {
              204: {
                description: 'No Content',
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    'x-xgen-version': '2023-01-01',
                  },
                  'application/vnd.atlas.2023-03-01+json': {
                    'x-xgen-version': '2023-01-01',
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
    name: 'invalid DELETE with non-void 204',
    document: {
      paths: {
        '/resource/{id}': {
          delete: {
            responses: {
              204: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: { type: 'object' },
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
        code: 'xgen-IPA-108-delete-response-should-be-empty',
        message:
          'Error found for application/vnd.atlas.2023-01-01+json: DELETE method should return an empty response. The response should not have a schema property.',
        path: ['paths', '/resource/{id}', 'delete', 'responses', '204'],
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
            responses: {
              204: {
                'application/vnd.atlas.2023-01-01+json': {
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-108-delete-response-should-be-empty': 'Legacy API',
                  },
                  content: {
                    schema: { type: 'object' },
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
    name: 'skipped for collection endpoint (no path parameter)',
    document: {
      paths: {
        '/resources': {
          delete: {
            responses: {
              204: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: { type: 'object' },
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
    name: 'applied for single resource endpoint (with path parameter)',
    document: {
      paths: {
        '/resources/{resourceId}': {
          delete: {
            responses: {
              204: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: { type: 'object' },
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
        code: 'xgen-IPA-108-delete-response-should-be-empty',
        message:
          'Error found for application/vnd.atlas.2023-01-01+json: DELETE method should return an empty response. The response should not have a schema property.',
        path: ['paths', '/resources/{resourceId}', 'delete', 'responses', '204'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
