import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const MISSING_LOCATION_ERROR_MESSAGE =
  'The 202 Accepted response must include a Location header pointing at the Operation resource URI.';

const lroExtension = { 'x-xgen-long-running-operation': { legacy: false } };
const legacyLroExtension = { 'x-xgen-long-running-operation': { legacy: true } };

const acceptedWithLocation = {
  responses: {
    202: {
      description: 'Accepted',
      headers: {
        Location: {
          schema: { type: 'string', format: 'uri' },
        },
      },
    },
  },
};

const acceptedWithoutLocation = {
  responses: {
    202: {
      description: 'Accepted',
    },
  },
};

testRule('xgen-IPA-132-lro-initiation-must-return-202-accepted-with-location', [
  {
    name: 'valid long-running operation returning 202 with a Location header',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            ...acceptedWithLocation,
          },
        },
        '/api/atlas/v2/resourceName/{pathParam}': {
          delete: {
            ...lroExtension,
            ...acceptedWithLocation,
          },
        },
        // Per-service source specs carry no extension: the declared 202 selects the operation
        '/api/atlas/v2/otherResourceName': {
          post: acceptedWithLocation,
        },
      },
    },
    errors: [],
  },
  {
    name: 'header names are compared case-insensitively',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: {
              202: {
                headers: {
                  location: {
                    schema: { type: 'string', format: 'uri' },
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
    name: 'synchronous operations without a 202 response are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            responses: {
              201: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    // The merge step derives the extension from the 202 and removes it otherwise, so a
    // hand-authored extension without a 202 does not make an operation long-running
    name: 'operations tagged without a 202 response are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            responses: {
              201: {},
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'legacy long-running operations are ignored',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/{pathParam}': {
          delete: {
            ...legacyLroExtension,
            ...acceptedWithoutLocation,
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
            ...acceptedWithoutLocation,
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid untagged operation declaring a 202 without a Location header',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...acceptedWithoutLocation,
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-initiation-must-return-202-accepted-with-location',
        message: MISSING_LOCATION_ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName', 'post', 'responses', '202'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid 202 response without a Location header',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            ...lroExtension,
            ...acceptedWithoutLocation,
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-initiation-must-return-202-accepted-with-location',
        message: MISSING_LOCATION_ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName', 'post', 'responses', '202'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'extensions without a legacy marker are validated',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {
            'x-xgen-long-running-operation': {},
            ...acceptedWithoutLocation,
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-initiation-must-return-202-accepted-with-location',
        message: MISSING_LOCATION_ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName', 'post', 'responses', '202'],
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
            ...acceptedWithoutLocation,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-lro-initiation-must-return-202-accepted-with-location': 'reason',
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
            ...acceptedWithLocation,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-lro-initiation-must-return-202-accepted-with-location': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-lro-initiation-must-return-202-accepted-with-location',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName',
          'post',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-lro-initiation-must-return-202-accepted-with-location',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
