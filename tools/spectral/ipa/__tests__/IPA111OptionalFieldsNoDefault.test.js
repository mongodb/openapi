import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-111-optional-fields-no-default', [
  {
    name: 'valid optional field without default',
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
    name: 'valid required field with default',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string', default: 'value' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid optional field with default and server-computed extension',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                default: 'value',
                'x-xgen-server-computed-when-client-omitted': true,
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid optional boolean field with default (handled by other rule)',
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
    name: 'valid optional field with default in component (request-scoped, skipped)',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              name: { type: 'string', default: 'value' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid optional field with default in request body (response is skipped)',
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
                      size: { type: 'integer', default: 5 },
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
                        region: { type: 'string', default: 'US_EAST' },
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
        code: 'xgen-IPA-111-optional-fields-no-default',
        message:
          'Optional fields must not define a default value. Remove the default or mark the field with x-xgen-server-computed-when-client-omitted if the server computes it when omitted.',
        path: [
          'paths',
          '/resources',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'size',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid optional field with default - exception',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                default: 'value',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-111-optional-fields-no-default': 'Reason',
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
