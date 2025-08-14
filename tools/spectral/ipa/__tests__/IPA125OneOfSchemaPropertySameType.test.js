import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-125-oneOf-schema-property-same-type', [
  {
    name: 'valid oneOf with same property base types',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  nickname: { type: 'string' },
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
    name: 'invalid oneOf with different property base types',
    document: {
      components: {
        schemas: {
          ExampleSchemaInvalid: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'number' },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'number' }, // not string
                  age: { type: 'number' },
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-schema-property-same-type',
        path: ['components', 'schemas', 'ExampleSchemaInvalid'],
        message: "Property 'id' has different types or schemas in oneOf items.",
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid oneOf with multiple different base property types',
    document: {
      components: {
        schemas: {
          ExampleSchemaInvalid: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'string' },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'number' }, // not string
                  age: { type: 'number' }, // not string
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-schema-property-same-type',
        path: ['components', 'schemas', 'ExampleSchemaInvalid'],
        message: "Property 'id' has different types or schemas in oneOf items.",
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-125-oneOf-schema-property-same-type',
        path: ['components', 'schemas', 'ExampleSchemaInvalid'],
        message: "Property 'age' has different types or schemas in oneOf items.",
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'exception silences invalid oneOf with multiple different base property types',
    document: {
      components: {
        schemas: {
          ExampleSchemaInvalid: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'string' },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  age: { type: 'number' },
                },
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-125-oneOf-schema-property-same-type': 'reason for exemption',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid oneOf with same schema for object type property',
    document: {
      components: {
        schemas: {
          ExampleSchemaValid: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'number' },
                  name: {
                    // same schema for object type property
                    type: 'object',
                    properties: {
                      first: { type: 'string' },
                      last: { type: 'string' },
                    },
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'number' },
                  name: {
                    // same schema for object type property
                    type: 'object',
                    properties: {
                      first: { type: 'string' },
                      last: { type: 'string' },
                    },
                  },
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
    name: 'invalid oneOf with different schema for object type property',
    document: {
      components: {
        schemas: {
          ExampleSchemaInvalid: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'number' },
                  name: {
                    type: 'object',
                    properties: {
                      first: { type: 'string' },
                      last: { type: 'string' },
                    },
                  },
                  address: {
                    type: 'object',
                    properties: {
                      addressLine: { type: 'string' },
                      zip: { type: 'string' },
                    },
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'number' },
                  name: {
                    type: 'object',
                    properties: {
                      first: { type: 'string' },
                      last: { type: 'number' }, // not string
                    },
                  },
                  address: {
                    type: 'object',
                    properties: {
                      addressLine: { type: 'string' }, // no zip property
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-schema-property-same-type',
        path: ['components', 'schemas', 'ExampleSchemaInvalid'],
        message: "Property 'name' has different types or schemas in oneOf items.",
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-125-oneOf-schema-property-same-type',
        path: ['components', 'schemas', 'ExampleSchemaInvalid'],
        message: "Property 'address' has different types or schemas in oneOf items.",
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'exception silences invalid oneOf with different schema for object type property',
    document: {
      components: {
        schemas: {
          ExampleSchemaInvalid: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'number' },
                  name: {
                    type: 'object',
                    properties: {
                      first: { type: 'string' },
                      last: { type: 'string' },
                    },
                  },
                  address: {
                    type: 'object',
                    properties: {
                      addressLine: { type: 'string' },
                      zip: { type: 'string' },
                    },
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  age: { type: 'number' },
                  name: {
                    type: 'object',
                    properties: {
                      first: { type: 'string' },
                      last: { type: 'number' }, // not string
                    },
                  },
                  address: {
                    type: 'object',
                    properties: {
                      addressLine: { type: 'string' }, // no zip property
                    },
                  },
                },
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-125-oneOf-schema-property-same-type': 'reason for exemption',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid deep oneOf',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: {
                oneOf: [
                  {
                    $ref: '#/components/schemas/NameSchema1',
                  },
                  {
                    $ref: '#/components/schemas/NameSchema2',
                  },
                ],
              },
            },
          },
          NameSchema1: {
            type: 'object',
            properties: {
              first: { type: 'string' },
              last: { type: 'string' },
            },
          },
          NameSchema2: {
            type: 'object',
            properties: {
              first: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid deep oneOf',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: {
                oneOf: [
                  {
                    $ref: '#/components/schemas/NameSchema1',
                  },
                  {
                    $ref: '#/components/schemas/NameSchema2',
                  },
                ],
              },
            },
          },
          NameSchema1: {
            type: 'object',
            properties: {
              first: { type: 'string' },
              last: { type: 'string' },
            },
          },
          NameSchema2: {
            type: 'object',
            properties: {
              first: { type: 'number' }, // not string
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-schema-property-same-type',
        path: ['components', 'schemas', 'ExampleSchema', 'properties', 'name'],
        message: "Property 'first' has different types or schemas in oneOf items.",
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'exception silences invalid deep oneOf',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: {
                oneOf: [
                  {
                    $ref: '#/components/schemas/NameSchema1',
                  },
                  {
                    $ref: '#/components/schemas/NameSchema2',
                  },
                ],
                'x-xgen-IPA-exception': {
                  'xgen-IPA-125-oneOf-schema-property-same-type': 'reason for exemption',
                },
              },
            },
          },
          NameSchema1: {
            type: 'object',
            properties: {
              first: { type: 'string' },
              last: { type: 'string' },
            },
          },
          NameSchema2: {
            type: 'object',
            properties: {
              first: { type: 'number' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid nested oneOf',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            oneOf: [
              {
                type: 'object',
                properties: {
                  counter: {
                    type: 'string',
                    enum: ['ONE', 'TWO'],
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  counter: {
                    type: 'string',
                    enum: ['THREE', 'FOUR'],
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  counter: {
                    // Nested oneOf is valid since the entries are enums
                    oneOf: [
                      {
                        type: 'string',
                        enum: ['FIVE', 'SIX'],
                      },
                      {
                        type: 'string',
                        enum: ['5', '6'],
                      },
                    ],
                    type: 'object',
                  },
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
    name: 'invalid nested oneOf',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            oneOf: [
              {
                type: 'object',
                properties: {
                  counter: {
                    type: 'string',
                    enum: ['ONE', 'TWO'],
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  counter: {
                    type: 'string',
                    enum: ['THREE', 'FOUR'],
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  counter: {
                    // nested onOf counter is not enum
                    oneOf: [
                      {
                        type: 'number',
                      },
                      {
                        type: 'number',
                      },
                    ],
                    type: 'object',
                  },
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-schema-property-same-type',
        path: ['components', 'schemas', 'ExampleSchema'],
        message: "Property 'counter' has different types or schemas in oneOf items.",
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid nested oneOf with object type',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            oneOf: [
              {
                type: 'object',
                properties: {
                  threshold: {
                    $ref: '#/components/schemas/ThresholdSchema',
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  threshold: {
                    $ref: '#/components/schemas/ThresholdSchema',
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  threshold: {
                    type: 'object',
                    oneOf: [
                      {
                        $ref: '#/components/schemas/ThresholdSchema',
                      },
                      {
                        $ref: '#/components/schemas/ThresholdSchema',
                      },
                    ],
                  },
                },
              },
            ],
          },
          ThresholdSchema: {
            type: 'object',
            properties: {
              threshold: {
                type: 'object',
                properties: {
                  value: {
                    type: 'number',
                  },
                  unit: {
                    type: 'string',
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
    name: 'invalid nested oneOf with object type',
    document: {
      components: {
        schemas: {
          ExampleSchema: {
            type: 'object',
            oneOf: [
              {
                type: 'object',
                properties: {
                  threshold: {
                    $ref: '#/components/schemas/ThresholdSchema',
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  threshold: {
                    $ref: '#/components/schemas/ThresholdSchema',
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  threshold: {
                    type: 'object',
                    oneOf: [
                      {
                        $ref: '#/components/schemas/DifferentThresholdSchema',
                      },
                      {
                        $ref: '#/components/schemas/ThresholdSchema',
                      },
                    ],
                  },
                },
              },
            ],
          },
          ThresholdSchema: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
              },
              unit: {
                type: 'string',
              },
            },
          },
          DifferentThresholdSchema: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
              },
              unit: {
                type: 'string',
              },
              metricType: {
                // Extra parameter
                type: 'string',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-schema-property-same-type',
        path: ['components', 'schemas', 'ExampleSchema'],
        message: "Property 'threshold' has different types or schemas in oneOf items.",
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
