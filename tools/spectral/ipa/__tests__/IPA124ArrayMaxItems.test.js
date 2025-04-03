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
              items: {
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
              items: {
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
        message: 'Array must have maxItems property defined.',
        path: ['components', 'schemas', 'InvalidSchema', 'properties', 'items'],
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
              items: {
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
        path: ['components', 'schemas', 'InvalidSchema', 'properties', 'items'],
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
              items: {
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
                items: {
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
        path: ['components', 'schemas', 'NestedArrays', 'properties', 'outerArray', 'items'],
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
                      items: {
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
        message: 'Array must have maxItems property defined.',
        path: [
          'paths',
          '/api/resources',
          'post',
          'requestBody',
          'content',
          'application/json',
          'schema',
          'properties',
          'items',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
