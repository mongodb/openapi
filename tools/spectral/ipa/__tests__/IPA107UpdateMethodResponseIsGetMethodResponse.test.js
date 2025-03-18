import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    ResourceSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', readOnly: true },
        name: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string', readOnly: true },
      },
    },
    OtherSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
  },
};

testRule('xgen-IPA-107-update-method-response-is-get-method-response', [
  {
    name: 'valid update responses',
    document: {
      paths: {
        '/resources/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Multiple versions
        '/versionedResources/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
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
    name: 'rule ignores inapplicable cases',
    document: {
      paths: {
        // Path not ending in collection
        '/not/a/collection/resource/{id}': {
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Version mismatch but will be ignored
        '/versionMismatchResources/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Non-200 will be ignored
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              202: {
                requestBody: {
                  content: {
                    'application/vnd.atlas.2024-01-05+json': {
                      schema: {
                        $ref: '#/components/schemas/OtherSchema',
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
    name: 'invalid update responses',
    document: {
      paths: {
        // Get without schema - Patch
        '/resourceOne/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {},
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Get without schema - Put
        '/resourceTwo/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {},
                },
              },
            },
          },
          put: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Get without schema ref
        '/resourceThree/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
        },
        // Schema mismatch
        '/resourceFour/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/OtherSchema',
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
        code: 'xgen-IPA-107-update-method-response-is-get-method-response',
        message:
          'Could not validate that the Update method returns the same resource object as the Get method. The Get method does not have a schema.',
        path: [
          'paths',
          '/resourceOne/{id}',
          'patch',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-01-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-response-is-get-method-response',
        message:
          'Could not validate that the Update method returns the same resource object as the Get method. The Get method does not have a schema.',
        path: [
          'paths',
          '/resourceTwo/{id}',
          'put',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-01-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-response-is-get-method-response',
        message:
          'Could not validate that the Update method returns the same resource object as the Get method. The Get method does not have a schema reference.',
        path: [
          'paths',
          '/resourceThree/{id}',
          'patch',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-01-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-update-method-response-is-get-method-response',
        message: 'The schema in the Update method response must be the same schema as the response of the Get method.',
        path: [
          'paths',
          '/resourceFour/{id}',
          'patch',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-01-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with version mismatch',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {
                    schema: {
                      $ref: '#/components/schemas/OtherSchema',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
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
        code: 'xgen-IPA-107-update-method-response-is-get-method-response',
        message: 'The schema in the Update method response must be the same schema as the response of the Get method.',
        path: [
          'paths',
          '/resource/{id}',
          'patch',
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
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-107-update-method-response-is-get-method-response': 'Exception reason',
                    },
                    schema: {
                      type: 'object',
                      properties: {
                        completelyDifferent: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/resourceTwo/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: {
                      $ref: '#/components/schemas/ResourceSchema',
                    },
                  },
                },
              },
            },
          },
          patch: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-107-update-method-response-is-get-method-response': 'Exception reason',
                    },
                    schema: {
                      $ref: '#/components/schemas/OtherSchema',
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
