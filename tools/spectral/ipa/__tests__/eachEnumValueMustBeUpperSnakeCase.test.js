import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-123-enum-values-must-be-upper-snake-case', [
  {
    name: 'valid schema - components.schemas.property',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              exampleProperty: {
                enum: ['EXAMPLE_A', 'EXAMPLE_B'],
                type: 'string',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid schema with exception - components.schemas.property',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              exampleProperty: {
                enum: ['exampleA', 'exampleB'],
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-123-enum-values-must-be-upper-snake-case': 'reason',
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
    name: 'invalid schema - components.schemas.property',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              exampleProperty: {
                enum: ['exampleA', 'exampleB'],
                type: 'string',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-123-enum-values-must-be-upper-snake-case',
        message: 'enum[0]:exampleA enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'exampleProperty'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-123-enum-values-must-be-upper-snake-case',
        message: 'enum[1]:exampleB enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'exampleProperty'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid schema - components.schemas',
    document: {
      components: {
        schemas: {
          SchemaName: {
            enum: ['EXAMPLE_A', 'EXAMPLE_B'],
            type: 'string',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid schema with exception - components.schemas',
    document: {
      components: {
        schemas: {
          SchemaName: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-123-enum-values-must-be-upper-snake-case': 'reason',
            },
            enum: ['exampleA', 'exampleB'],
            type: 'string',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid schema - components.schemas',
    document: {
      components: {
        schemas: {
          SchemaName: {
            enum: ['exampleA', 'exampleB'],
            type: 'string',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-123-enum-values-must-be-upper-snake-case',
        message: 'enum[0]:exampleA enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['components', 'schemas', 'SchemaName'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-123-enum-values-must-be-upper-snake-case',
        message: 'enum[1]:exampleB enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['components', 'schemas', 'SchemaName'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid schema - paths.*',
    document: {
      paths: {
        '/a/{exampleId}': {
          get: {
            parameters: [
              {
                schema: {
                  type: 'string',
                  enum: ['EXAMPLE_A', 'EXAMPLE_B'],
                },
              },
            ],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid schema with exception - paths.*',
    document: {
      paths: {
        '/a/{exampleId}': {
          get: {
            parameters: [
              {
                schema: {
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-123-enum-values-must-be-upper-snake-case': 'reason',
                  },
                  type: 'string',
                  enum: ['exampleA', 'exampleB'],
                },
              },
            ],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid schema - paths.*',
    document: {
      paths: {
        '/a/{exampleId}': {
          get: {
            parameters: [
              {
                schema: {
                  type: 'string',
                  enum: ['exampleA', 'exampleB'],
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-123-enum-values-must-be-upper-snake-case',
        message: 'enum[0]:exampleA enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['paths', '/a/{exampleId}', 'get', 'parameters', '0', 'schema'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-123-enum-values-must-be-upper-snake-case',
        message: 'enum[1]:exampleB enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['paths', '/a/{exampleId}', 'get', 'parameters', '0', 'schema'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
