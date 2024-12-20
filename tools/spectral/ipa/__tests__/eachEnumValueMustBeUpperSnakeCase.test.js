import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-123-enum-values-must-be-upper-snake-case', [
  {
    name: 'valid schema - components.schemas',
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
    name: 'invalid schema with exception - components.schemas',
    document: {
      components: {
        schemas: {
          SchemaName: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-123-enum-values-must-be-upper-snake-case': 'reason',
            },
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
    errors: [],
  },
  {
    name: 'invalid schema - components.schemas',
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
        message: 'exampleA enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'exampleProperty', 'enum', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-123-enum-values-must-be-upper-snake-case',
        message: 'exampleB enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'exampleProperty', 'enum', '1'],
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
        message: 'exampleA enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['paths', '/a/{exampleId}', 'get', 'parameters', '0', 'schema', 'enum', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-123-enum-values-must-be-upper-snake-case',
        message: 'exampleB enum value must be UPPER_SNAKE_CASE.  http://go/ipa/123',
        path: ['paths', '/a/{exampleId}', 'get', 'parameters', '0', 'schema', 'enum', '1'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
