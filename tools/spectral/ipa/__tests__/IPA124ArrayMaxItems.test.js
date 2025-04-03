import testRule from './__helpers__/testRule.js';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-124-array-max-items', [
  {
    name: 'valid array with maxItems set to 100',
    document: {
      components: {
        schemas: {
          ValidSchema: {
            type: 'object',
            properties: {
              arrayProperty: {
                type: 'array',
                maxItems: 100,
                items: {
                  type: 'string',
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
    name: 'invalid array missing maxItems',
    document: {
      components: {
        schemas: {
          InvalidSchema: {
            type: 'object',
            properties: {
              arrayProperty: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-124-array-max-items',
        message: 'Array must have maxItems property defined to enforce an upper bound on the number of items.',
        path: ['components', 'schemas', 'InvalidSchema', 'properties', 'arrayProperty'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid array with incorrect maxItems value',
    document: {
      components: {
        schemas: {
          InvalidSchema: {
            type: 'object',
            properties: {
              arrayProperty: {
                type: 'array',
                maxItems: 50,
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-124-array-max-items',
        message: 'Array maxItems must be set to 100, found: 50.',
        path: ['components', 'schemas', 'InvalidSchema', 'properties', 'arrayProperty'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'array with exception should be skipped',
    document: {
      components: {
        schemas: {
          ExceptionSchema: {
            type: 'object',
            properties: {
              arrayProperty: {
                type: 'array',
                items: {
                  type: 'string',
                },
                'x-xgen-IPA-exception': {
                  'xgen-IPA-124-array-max-items': 'Reason',
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
    name: 'nested arrays should all be checked',
    document: {
      components: {
        schemas: {
          NestedArrays: {
            type: 'object',
            properties: {
              outerArray: {
                type: 'array',
                maxItems: 100,
                arrayProperty: {
                  type: 'array',
                  maxItems: 50,
                  items: {
                    type: 'string',
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
        code: 'xgen-IPA-124-array-max-items',
        message: 'Array maxItems must be set to 100, found: 50.',
        path: ['components', 'schemas', 'NestedArrays', 'properties', 'outerArray', 'arrayProperty'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'arrays in request/response bodies should be checked',
    document: {
      paths: {
        '/api/resources': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      arrayProperty: {
                        type: 'array',
                        items: {
                          type: 'string',
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
    },
    errors: [
      {
        code: 'xgen-IPA-124-array-max-items',
        message: 'Array must have maxItems property defined to enforce an upper bound on the number of items.',
        path: [
          'paths',
          '/api/resources',
          'post',
          'requestBody',
          'content',
          'application/json',
          'schema',
          'properties',
          'arrayProperty',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
