import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-objects-must-be-well-defined', [
  {
    name: 'valid objects',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    type: 'object',
                    schema: {},
                  },
                  'application/vnd.atlas.2023-08-05+json': {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'object',
                        properties: {},
                      },
                      hobbies: {
                        type: 'array',
                        items: {
                          type: 'object',
                          example: 'test',
                        },
                      },
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2023-08-05+json': {
                  type: 'object',
                  examples: {},
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          SchemaOneOf: {
            type: 'object',
            oneOf: {},
          },
          SchemaAllOf: {
            type: 'object',
            allOf: {},
          },
          SchemaAnyOf: {
            type: 'object',
            anyOf: {},
          },
          ArraySchema: {
            type: 'array',
            items: {
              type: 'object',
              schema: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid schema ref',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    $ref: '#/components/schemas/Schema',
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
            type: 'object',
            properties: {},
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid objects',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    type: 'object',
                  },
                  'application/vnd.atlas.2023-08-05+json': {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'object',
                      },
                      hobbies: {
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
            requestBody: {
              content: {
                'application/vnd.atlas.2023-08-05+json': {
                  type: 'object',
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          SchemaOneOf: {
            type: 'object',
          },
          SchemaAllOf: {
            type: 'object',
          },
          SchemaAnyOf: {
            type: 'object',
          },
          ArraySchema: {
            type: 'array',
            items: {
              type: 'object',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-08-05+json',
          'properties',
          'name',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: [
          'paths',
          '/resource/{id}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2023-08-05+json',
          'properties',
          'hobbies',
          'items',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: ['paths', '/resource/{id}', 'get', 'requestBody', 'content', 'application/vnd.atlas.2023-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: ['components', 'schemas', 'SchemaOneOf'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: ['components', 'schemas', 'SchemaAllOf'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: ['components', 'schemas', 'SchemaAnyOf'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: ['components', 'schemas', 'ArraySchema', 'items'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid schema ref',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    $ref: '#/components/schemas/Schema',
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
            type: 'object',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-objects-must-be-well-defined',
        message:
          'Components of type "object" must be well-defined with for example a schema, example(s) or properties.',
        path: ['components', 'schemas', 'Schema'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid OAS with exceptions',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    type: 'object',
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-117-objects-must-be-well-defined': 'reason',
                    },
                  },
                  'application/vnd.atlas.2023-08-05+json': {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'object',
                        'x-xgen-IPA-exception': {
                          'xgen-IPA-117-objects-must-be-well-defined': 'reason',
                        },
                      },
                      hobbies: {
                        type: 'array',
                        items: {
                          type: 'object',
                          'x-xgen-IPA-exception': {
                            'xgen-IPA-117-objects-must-be-well-defined': 'reason',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2023-08-05+json': {
                  type: 'object',
                  'x-xgen-IPA-exception': {
                    'xgen-IPA-117-objects-must-be-well-defined': 'reason',
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          SchemaOneOf: {
            type: 'object',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-objects-must-be-well-defined': 'reason',
            },
          },
          SchemaAllOf: {
            type: 'object',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-objects-must-be-well-defined': 'reason',
            },
          },
          SchemaAnyOf: {
            type: 'object',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-objects-must-be-well-defined': 'reason',
            },
          },
          ArraySchema: {
            type: 'array',
            items: {
              type: 'object',
              'x-xgen-IPA-exception': {
                'xgen-IPA-117-objects-must-be-well-defined': 'reason',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
