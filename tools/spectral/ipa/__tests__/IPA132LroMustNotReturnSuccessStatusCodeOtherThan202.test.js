import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const lroExtension = { 'x-xgen-long-running-operation': { legacy: false } };
const legacyLroExtension = { 'x-xgen-long-running-operation': { legacy: true } };

const accepted = {
  202: {
    description: 'Accepted',
    headers: {
      Location: {
        schema: { type: 'string', format: 'uri' },
      },
    },
  },
};

testRule('xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202', [
  {
    name: 'valid long-running operation returning only 202',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: {
              ...accepted,
              400: {},
              404: {},
            },
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
    name: 'invalid untagged operation declaring a 202 alongside another success status code',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            responses: {
              200: {},
              202: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202',
        message:
          'The long-running operation must not return the 200 success status code. 202 Accepted is the only success response of a long-running operation.',
        path: ['paths', '/api/atlas/v2/resourceName', 'post', 'responses', '200'],
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
            responses: {
              200: {},
              202: {},
            },
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
          patch: {
            operationId: 'updateGroupUserSecurity',
            responses: {
              200: {},
              202: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid long-running operation with an additional success status code',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: {
              200: {},
              ...accepted,
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202',
        message:
          'The long-running operation must not return the 200 success status code. 202 Accepted is the only success response of a long-running operation.',
        path: ['paths', '/api/atlas/v2/resourceName', 'post', 'responses', '200'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid long-running operation with a wildcard success status code',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: {
              ...accepted,
              '2XX': {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202',
        message:
          'The long-running operation must not return the 2XX success status code. 202 Accepted is the only success response of a long-running operation.',
        path: ['paths', '/api/atlas/v2/resourceName', 'post', 'responses', '2XX'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid long-running operation with multiple additional success status codes',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          put: {
            ...lroExtension,
            responses: {
              200: {},
              ...accepted,
              204: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202',
        message:
          'The long-running operation must not return the 200 success status code. 202 Accepted is the only success response of a long-running operation.',
        path: ['paths', '/api/atlas/v2/resourceName', 'put', 'responses', '200'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202',
        message:
          'The long-running operation must not return the 204 success status code. 202 Accepted is the only success response of a long-running operation.',
        path: ['paths', '/api/atlas/v2/resourceName', 'put', 'responses', '204'],
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
            responses: {
              200: {},
              ...accepted,
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202': 'reason',
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
            responses: {
              ...accepted,
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'post',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-lro-must-not-return-success-status-code-other-than-202',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
