import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-111-optional-boolean-fields-default-false', [
  {
    name: 'valid optional boolean field with default false',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean', default: false },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid required boolean field without default',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            required: ['enabled'],
            properties: {
              enabled: { type: 'boolean' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid non-boolean field without default',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid optional boolean field without default in component (request-scoped, skipped)',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid optional boolean field with default true in component (request-scoped, skipped)',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean', default: true },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid optional boolean field in request (paused) but response is skipped',
    document: {
      paths: {
        '/resources': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      paused: { type: 'boolean' },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        hidden: { type: 'boolean', default: true },
                      },
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
        code: 'xgen-IPA-111-optional-boolean-fields-default-false',
        message: 'Optional boolean fields must default to false.',
        path: [
          'paths',
          '/resources',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'paused',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid optional boolean field without default - exception',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              enabled: {
                type: 'boolean',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-111-optional-boolean-fields-default-false': 'Reason',
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
