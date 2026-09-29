import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-111-boolean-fields-not-nullable', [
  {
    name: 'valid non-nullable boolean fields',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean', default: false },
              paused: { type: 'boolean', nullable: false },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid nullable non-boolean field',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              name: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid nullable boolean fields in components, request and response schemas',
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
                      paused: { type: 'boolean', nullable: true },
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
                        hidden: { type: 'boolean', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Schema: {
            allOf: [
              { type: 'object' },
              {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean', nullable: true },
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-111-boolean-fields-not-nullable',
        message: 'Boolean fields must not be nullable.',
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
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-111-boolean-fields-not-nullable',
        message: 'Boolean fields must not be nullable.',
        path: [
          'paths',
          '/resources',
          'post',
          'responses',
          '201',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'hidden',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-111-boolean-fields-not-nullable',
        message: 'Boolean fields must not be nullable.',
        path: ['components', 'schemas', 'Schema', 'allOf', '1', 'properties', 'enabled'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid nullable boolean field - exception',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              enabled: {
                type: 'boolean',
                nullable: true,
                'x-xgen-IPA-exception': {
                  'xgen-IPA-111-boolean-fields-not-nullable': 'Reason',
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
