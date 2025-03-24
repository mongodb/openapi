import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-112-boolean-field-names-avoid-is-prefix', [
  {
    name: 'valid schema - no "is" prefix in boolean fields',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              enabled: { type: 'boolean' },
              active: { type: 'boolean' },
              disabled: { type: 'boolean' },
              isString: { type: 'string' },
              visible: { type: 'boolean' },
            },
          },
        },
      },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      available: { type: 'boolean' },
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
                        valid: { type: 'boolean' },
                        hidden: { type: 'boolean' },
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
    errors: [],
  },
  {
    name: 'invalid schema - with "is" prefix in boolean fields',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              isEnabled: { type: 'boolean' },
              isActive: { type: 'boolean' },
              isError: { type: 'boolean' },
              isString: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      isAvailable: { type: 'boolean' },
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
                        isValid: { type: 'boolean' },
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
        code: 'xgen-IPA-112-boolean-field-names-avoid-is-prefix',
        message: 'Boolean field "isEnabled" should not use the "is" prefix. Use "enabled" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'isEnabled'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-boolean-field-names-avoid-is-prefix',
        message: 'Boolean field "isActive" should not use the "is" prefix. Use "active" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'isActive'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-boolean-field-names-avoid-is-prefix',
        message: 'Boolean field "isError" should not use the "is" prefix. Use "error" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'isError'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-boolean-field-names-avoid-is-prefix',
        message: 'Boolean field "isAvailable" should not use the "is" prefix. Use "available" instead.',
        path: [
          'paths',
          '/users',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'isAvailable',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-boolean-field-names-avoid-is-prefix',
        message: 'Boolean field "isValid" should not use the "is" prefix. Use "valid" instead.',
        path: [
          'paths',
          '/users',
          'post',
          'responses',
          '201',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'isValid',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'schema with exception - "is" prefix with exception',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              isEnabled: {
                type: 'boolean',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-boolean-field-names-avoid-is-prefix': 'Reason',
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
