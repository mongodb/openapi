import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const ERROR_MESSAGE =
  'The 202 Accepted response must not include a response body schema. The operation handle is conveyed through the Location header.';

const lroExtension = { 'x-xgen-long-running-operation': { legacy: false } };
const legacyLroExtension = { 'x-xgen-long-running-operation': { legacy: true } };

const acceptedWithoutContent = {
  202: {
    description: 'Accepted',
    headers: {
      Location: {
        schema: { type: 'string', format: 'uri' },
      },
    },
  },
};

// Media types carrying only versioning metadata, without a schema, are allowed
const acceptedWithVersionedContent = {
  202: {
    description: 'Accepted',
    content: {
      'application/vnd.atlas.2024-08-05+json': {
        'x-xgen-version': '2024-08-05',
      },
    },
  },
};

const acceptedWithSchema = {
  202: {
    description: 'Accepted',
    content: {
      'application/vnd.atlas.2024-08-05+json': {
        schema: {
          type: 'object',
        },
      },
    },
  },
};

testRule('xgen-IPA-132-lro-202-response-must-not-include-content', [
  {
    name: 'valid 202 responses without a body schema',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: acceptedWithoutContent,
          },
        },
        '/api/atlas/v2/resourceName/{pathParam}': {
          delete: {
            ...lroExtension,
            responses: acceptedWithVersionedContent,
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'synchronous operations without a 202 response are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            responses: {
              200: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    // Per-service source specs carry no extension: the declared 202 selects the operation
    name: 'invalid untagged operation declaring a 202 with a body schema',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            responses: acceptedWithSchema,
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-202-response-must-not-include-content',
        message: ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'post',
          'responses',
          '202',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'legacy long-running operations are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...legacyLroExtension,
            responses: acceptedWithSchema,
          },
        },
      },
    },
    errors: [],
  },
  {
    // On per-service source specs, where the merge step has not marked legacy operations,
    // the shared legacy operationId list excludes them
    name: 'legacy operations matched by operationId are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          delete: {
            operationId: 'deleteGroupCluster',
            responses: acceptedWithSchema,
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid 202 response with a body schema',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: acceptedWithSchema,
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-202-response-must-not-include-content',
        message: ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'post',
          'responses',
          '202',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid 202 response with schemas in multiple media types',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: {
              202: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: { type: 'object' },
                  },
                  'application/vnd.atlas.2025-01-01+json': {
                    schema: { type: 'object' },
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
        code: 'xgen-IPA-132-lro-202-response-must-not-include-content',
        message: ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'post',
          'responses',
          '202',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-lro-202-response-must-not-include-content',
        message: ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'post',
          'responses',
          '202',
          'content',
          'application/vnd.atlas.2025-01-01+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid long-running operations with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: acceptedWithSchema,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-lro-202-response-must-not-include-content': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'compliant long-running operations do not need an exception',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: acceptedWithoutContent,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-lro-202-response-must-not-include-content': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-202-response-must-not-include-content',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'post',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-lro-202-response-must-not-include-content',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
