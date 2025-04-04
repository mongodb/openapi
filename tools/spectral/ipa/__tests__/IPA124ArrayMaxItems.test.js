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
              anotherArrayProperty: {
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
              links: {
                type: 'array',
                items: {
                  type: 'object',
                },
              },
              results: {
                type: 'array',
                items: {
                  type: 'object',
                },
              },
              mapProperty: {
                type: 'object',
                additionalProperties: {
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
                maxItems: 101,
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
        message:
          'The maxItems value for arrays must be set to 100 or below, found: 101. If the array field has the chance of being too large, the API should use a sub-resource instead.',
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
                maxItems: 500,
                arrayProperty: {
                  type: 'array',
                  maxItems: 500,
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
        message:
          'The maxItems value for arrays must be set to 100 or below, found: 500. If the array field has the chance of being too large, the API should use a sub-resource instead.',
        path: ['components', 'schemas', 'NestedArrays', 'properties', 'outerArray'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-124-array-max-items',
        message:
          'The maxItems value for arrays must be set to 100 or below, found: 500. If the array field has the chance of being too large, the API should use a sub-resource instead.',
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
  {
    name: 'parameter arrays should be checked',
    document: {
      paths: {
        '/api/resources': {
          get: {
            parameters: [
              {
                name: 'ids',
                in: 'query',
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
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
        code: 'xgen-IPA-124-array-max-items',
        message: 'Array must have maxItems property defined to enforce an upper bound on the number of items.',
        path: ['paths', '/api/resources', 'get', 'parameters', '0', 'schema'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'arrays with property names in the ignore list should be skipped',
    document: {
      components: {
        schemas: {
          IgnoredSchema: {
            type: 'object',
            properties: {
              links: {
                type: 'array',
                items: {
                  type: 'object',
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
    name: 'arrays in response content should be checked - invalid case',
    document: {
      paths: {
        '/api/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
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
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-01-01+json',
          'schema',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'arrays in response content should be checked - valid case',
    document: {
      paths: {
        '/api/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'array',
                      maxItems: 100,
                      items: {
                        type: 'object',
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
    name: 'arrays in response content with excessive maxItems',
    document: {
      paths: {
        '/api/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'array',
                      maxItems: 500,
                      items: {
                        type: 'object',
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
        message:
          'The maxItems value for arrays must be set to 100 or below, found: 500. If the array field has the chance of being too large, the API should use a sub-resource instead.',
        path: [
          'paths',
          '/api/resources',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-01-01+json',
          'schema',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'arrays in response content with exception should be skipped',
    document: {
      paths: {
        '/api/resources': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2023-01-01+json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                      },
                      'x-xgen-IPA-exception': {
                        'xgen-IPA-124-array-max-items': 'Large response array is necessary',
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
]);
