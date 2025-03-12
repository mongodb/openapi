import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    ValidSchemaResponse: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          readOnly: true,
        },
        name: {
          type: 'string',
        },
      },
    },
    InvalidSchemaResponse: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          readOnly: true,
        },
        name: {
          type: 'string',
          writeOnly: true,
        },
      },
    },
  },
};

testRule('xgen-IPA-104-get-method-response-has-no-input-fields', [
  {
    name: 'valid get responses',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ValidSchemaResponse',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          readOnly: true,
                        },
                        name: {
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
      components: componentSchemas,
    },
    errors: [],
  },
  {
    name: 'invalid GET with body',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/InvalidSchemaResponse',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          readOnly: true,
                        },
                        name: {
                          type: 'string',
                          writeOnly: true,
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
      components: componentSchemas,
    },
    errors: [
      {
        code: 'xgen-IPA-104-get-method-response-has-no-input-fields',
        message:
          'The get method response object must not include output fields (writeOnly properties). Found writeOnly property at: name. http://go/ipa/104',
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
        code: 'xgen-IPA-104-get-method-response-has-no-input-fields',
        message:
          'The get method response object must not include output fields (writeOnly properties). Found writeOnly property at: name. http://go/ipa/104',
        path: [
          'paths',
          '/resource/{id}/singleton',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with exception',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-response-has-no-input-fields': 'reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/InvalidSchemaResponse',
                    },
                  },
                },
              },
            },
          },
        },
        '/resource/{id}/singleton': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-104-get-method-response-has-no-input-fields': 'reason',
                    },
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          readOnly: true,
                        },
                        name: {
                          type: 'string',
                          writeOnly: true,
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
      components: componentSchemas,
    },
    errors: [],
  },
]);
