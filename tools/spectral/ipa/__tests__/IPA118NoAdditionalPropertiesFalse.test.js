import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-118-no-additional-properties-false', [
  {
    name: 'valid without additionalProperties',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'integer' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid with additionalProperties: true',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            additionalProperties: true,
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid with additionalProperties as schema',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            additionalProperties: {
              type: 'string',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid with additionalProperties: false',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            additionalProperties: false,
          },
          ReferencedSchema: {
            type: 'object',
            properties: {
              property: { $ref: '#/components/schemas/ExampleSchema' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-118-no-additional-properties-false',
        message:
          "Schema must not use 'additionalProperties: false'. Consider using 'additionalProperties: true' or omitting the property.",
        path: ['components', 'schemas', 'ExampleSchema'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with nested additionalProperties: false',
    document: {
      components: {
        schemas: {
          ParentSchema: {
            type: 'object',
            properties: {
              child: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                additionalProperties: false,
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-118-no-additional-properties-false',
        message:
          "Schema must not use 'additionalProperties: false'. Consider using 'additionalProperties: true' or omitting the property.",
        path: ['components', 'schemas', 'ParentSchema', 'properties', 'child'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with multiple nested additionalProperties: false',
    document: {
      components: {
        schemas: {
          ParentSchema: {
            type: 'object',
            properties: {
              child: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-118-no-additional-properties-false',
        message:
          "Schema must not use 'additionalProperties: false'. Consider using 'additionalProperties: true' or omitting the property.",
        path: ['components', 'schemas', 'ParentSchema'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-118-no-additional-properties-false',
        message:
          "Schema must not use 'additionalProperties: false'. Consider using 'additionalProperties: true' or omitting the property.",
        path: ['components', 'schemas', 'ParentSchema', 'properties', 'child'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'with exception',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            'x-xgen-IPA-exception': {
              'xgen-IPA-118-no-additional-properties-false': 'Exception reason',
            },
            properties: {
              name: { type: 'string' },
            },
            additionalProperties: false,
          },
          ParentSchema: {
            type: 'object',
            'x-xgen-IPA-exception': {
              'xgen-IPA-118-no-additional-properties-false': 'Exception reason',
            },
            properties: {
              child: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                additionalProperties: false,
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid with multiple nested additionalProperties: false - exceptions',
    document: {
      components: {
        schemas: {
          ParentSchema: {
            type: 'object',
            properties: {
              child: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
            'x-xgen-IPA-exception': {
              'xgen-IPA-118-no-additional-properties-false': 'Exception reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
