import testRule from './__helpers__/testRule.js';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-123-enum-values-should-not-exceed-20', [
  {
    name: 'valid when enum has exactly 20 values',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              status: {
                type: 'string',
                enum: [
                  'VALUE_1',
                  'VALUE_2',
                  'VALUE_3',
                  'VALUE_4',
                  'VALUE_5',
                  'VALUE_6',
                  'VALUE_7',
                  'VALUE_8',
                  'VALUE_9',
                  'VALUE_10',
                  'VALUE_11',
                  'VALUE_12',
                  'VALUE_13',
                  'VALUE_14',
                  'VALUE_15',
                  'VALUE_16',
                  'VALUE_17',
                  'VALUE_18',
                  'VALUE_19',
                  'VALUE_20',
                ],
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid when enum has fewer than 20 values',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              status: {
                type: 'string',
                enum: ['PENDING', 'ACTIVE', 'COMPLETE', 'FAILED'],
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid when enum has more than 20 values',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              status: {
                type: 'string',
                enum: [
                  'VALUE_1',
                  'VALUE_2',
                  'VALUE_3',
                  'VALUE_4',
                  'VALUE_5',
                  'VALUE_6',
                  'VALUE_7',
                  'VALUE_8',
                  'VALUE_9',
                  'VALUE_10',
                  'VALUE_11',
                  'VALUE_12',
                  'VALUE_13',
                  'VALUE_14',
                  'VALUE_15',
                  'VALUE_16',
                  'VALUE_17',
                  'VALUE_18',
                  'VALUE_19',
                  'VALUE_20',
                  'VALUE_21',
                ],
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-123-enum-values-should-not-exceed-20',
        message: 'Enum arrays should not exceed 20 values. Current count: 21',
        path: ['components', 'schemas', 'TestSchema', 'properties', 'status', 'enum'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid when exception is defined',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              status: {
                type: 'string',
                enum: [
                  'VALUE_1',
                  'VALUE_2',
                  'VALUE_3',
                  'VALUE_4',
                  'VALUE_5',
                  'VALUE_6',
                  'VALUE_7',
                  'VALUE_8',
                  'VALUE_9',
                  'VALUE_10',
                  'VALUE_11',
                  'VALUE_12',
                  'VALUE_13',
                  'VALUE_14',
                  'VALUE_15',
                  'VALUE_16',
                  'VALUE_17',
                  'VALUE_18',
                  'VALUE_19',
                  'VALUE_20',
                  'VALUE_21',
                  'VALUE_22',
                  'VALUE_23',
                  'VALUE_24',
                  'VALUE_25',
                ],
                'x-xgen-IPA-exception': {
                  'xgen-IPA-123-enum-values-should-not-exceed-20': 'Legacy enum with more than 20 values',
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
    name: 'invalid with integer enum values exceeding limit',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              priority: {
                type: 'integer',
                enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-123-enum-values-should-not-exceed-20',
        message: 'Enum arrays should not exceed 20 values. Current count: 21',
        path: ['components', 'schemas', 'TestSchema', 'properties', 'priority', 'enum'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid for parameters in path operation',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
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
    name: 'invalid for parameters in path operation exceeding limit',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: [
                    'VAL_1',
                    'VAL_2',
                    'VAL_3',
                    'VAL_4',
                    'VAL_5',
                    'VAL_6',
                    'VAL_7',
                    'VAL_8',
                    'VAL_9',
                    'VAL_10',
                    'VAL_11',
                    'VAL_12',
                    'VAL_13',
                    'VAL_14',
                    'VAL_15',
                    'VAL_16',
                    'VAL_17',
                    'VAL_18',
                    'VAL_19',
                    'VAL_20',
                    'VAL_21',
                  ],
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-123-enum-values-should-not-exceed-20',
        message: 'Enum arrays should not exceed 20 values. Current count: 21',
        path: ['paths', '/resources', 'get', 'parameters', '0', 'schema', 'enum'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
