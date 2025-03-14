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

testRule('xgen-IPA-106-create-method-response-is-get-method-response', [
  {
    name: 'valid create requests',
    document: {
      paths: {
        '/resources': {
          post: {
            responses: {
              201: {
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
        },
        // Multiple versions
        '/versionedResources': {
          post: {
            responses: {
              201: {
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
        '/not/a/collection/resource': {
          post: {
            requestBody: {
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
        // Version mismatch but will be ignored
        '/versionMismatchResources': {
          post: {
            requestBody: {
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
        },
      },
      components: componentSchemas,
    },
    errors: [],
  },
  {
    name: 'invalid create requests',
    document: {
      paths: {
        // Get without schema
        '/resourcesOne': {
          post: {
            responses: {
              201: {
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
        '/resourcesOne/{id}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-05+json': {},
                },
              },
            },
          },
        },
        // Get without schema ref
        '/resourcesTwo': {
          post: {
            responses: {
              201: {
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
        '/resourcesTwo/{id}': {
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
        },
      },
      components: componentSchemas,
    },
    errors: [
      {
        code: 'xgen-IPA-106-create-method-response-is-get-method-response',
        message:
          'Could not validate that the Create method returns the same resource object as the Get method. The Get method does not have a schema. http://go/ipa-spectral#IPA-106',
        path: [
          'paths',
          '/resourcesOne',
          'post',
          'responses',
          '201',
          'content',
          'application/vnd.atlas.2024-01-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-response-is-get-method-response',
        message:
          'Could not validate that the Create method returns the same resource object as the Get method. The Get method does not have a schema reference. http://go/ipa-spectral#IPA-106',
        path: [
          'paths',
          '/resourcesTwo',
          'post',
          'responses',
          '201',
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
        '/resources': {
          post: {
            responses: {
              201: {
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
        '/resources/{id}': {
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
        },
      },
      components: componentSchemas,
    },
    errors: [
      {
        code: 'xgen-IPA-106-create-method-response-is-get-method-response',
        message:
          'The schema in the Create method response must be the same schema as the response of the Get method. http://go/ipa-spectral#IPA-106',
        path: ['paths', '/resources', 'post', 'responses', '201', 'content', 'application/vnd.atlas.2024-08-05+json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with exception',
    document: {
      paths: {
        '/resources': {
          post: {
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-106-create-method-response-is-get-method-response': 'Exception reason',
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
        },
      },
      components: componentSchemas,
    },
    errors: [],
  },
]);
