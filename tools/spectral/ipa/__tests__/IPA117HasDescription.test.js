import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-description', [
  {
    name: 'valid components',
    document: {
      info: {
        description: 'description',
      },
      tags: [
        {
          name: 'Tag',
          description: 'description',
        },
      ],
      paths: {
        '/resource': {
          get: {
            description: 'description',
            parameters: {
              id: {
                description: 'description',
              },
            },
          },
          // Ignores non-operations
          'x-extension': {},
        },
      },
      components: {
        schemas: {
          Schema: {
            properties: {
              id: {
                description: 'description',
              },
            },
          },
        },
        parameters: {
          parameter: {
            description: 'description',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid components',
    document: {
      info: {},
      tags: [
        {
          name: 'Tag',
        },
      ],
      paths: {
        '/resource': {
          get: {
            parameters: {
              id: {},
            },
          },
        },
      },
      components: {
        schemas: {
          Schema: {
            properties: {
              id: {},
            },
          },
        },
        parameters: {
          parameter: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['info'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['tags', '0'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['paths', '/resource', 'get'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['paths', '/resource', 'get', 'parameters', 'id'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'Schema', 'properties', 'id'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'parameters', 'parameter'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid empty description',
    document: {
      components: {
        schemas: {
          Schema: {
            properties: {
              id: {
                description: '',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'Schema', 'properties', 'id'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid array schema',
    document: {
      components: {
        schemas: {
          ArraySchema: {
            type: 'array',
            items: {
              properties: {
                id: {},
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'ArraySchema', 'items', 'properties', 'id'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid nested schema',
    document: {
      components: {
        schemas: {
          NestedSchema: {
            properties: {
              name: {
                properties: {
                  first: {},
                  last: {},
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'NestedSchema', 'properties', 'name'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'NestedSchema', 'properties', 'name', 'properties', 'first'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'NestedSchema', 'properties', 'name', 'properties', 'last'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid paginated schema',
    document: {
      components: {
        schemas: {
          PaginatedSchema: {
            properties: {
              results: {
                type: 'array',
                items: {
                  properties: {
                    first: {},
                    last: {},
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
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'PaginatedSchema', 'properties', 'results'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'PaginatedSchema', 'properties', 'results', 'items', 'properties', 'first'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: ['components', 'schemas', 'PaginatedSchema', 'properties', 'results', 'items', 'properties', 'last'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid inline schemas',
    document: {
      paths: {
        '/resource': {
          post: {
            description: 'description',
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      properties: {
                        id: {},
                      },
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    properties: {
                      id: {},
                    },
                  },
                },
                'application/vnd.atlas.2025-01-01+json': {
                  schema: {
                    properties: {
                      id: {},
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
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: [
          'paths',
          '/resource',
          'post',
          'responses',
          '201',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'id',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: [
          'paths',
          '/resource',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'id',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-description',
        message:
          'Description not found. API producers must provide descriptions for Properties, Operations and Parameters.',
        path: [
          'paths',
          '/resource',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2025-01-01+json',
          'schema',
          'properties',
          'id',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid components with exceptions',
    document: {
      info: {
        'x-xgen-IPA-exception': {
          'xgen-IPA-117-description': 'reason',
        },
      },
      tags: [
        {
          name: 'Tag',
          'x-xgen-IPA-exception': {
            'xgen-IPA-117-description': 'reason',
          },
        },
      ],
      paths: {
        '/resource': {
          get: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-description': 'reason',
            },
            parameters: {
              id: {
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description': 'reason',
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Schema: {
            properties: {
              id: {
                'x-xgen-IPA-exception': {
                  'xgen-IPA-117-description': 'reason',
                },
              },
            },
          },
        },
        parameters: {
          parameter: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-description': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
