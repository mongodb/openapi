import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const MISSING_STATUS_ERROR_MESSAGE = 'OperationResponse must report progress through a status field.';
const STATUS_ENUM_ERROR_MESSAGE =
  'The status field must use exactly the enum [PENDING, IN_PROGRESS, SUCCEEDED, FAILED, CANCELED, SUPERSEDED].';

testRule('xgen-IPA-132-operation-status-must-use-the-standard-status-enum', [
  {
    name: 'valid OperationResponse with the standard status enum',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED', 'SUPERSEDED'],
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid OperationResponse with the standard status enum in a different order',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['SUCCEEDED', 'FAILED', 'CANCELED', 'SUPERSEDED', 'PENDING', 'IN_PROGRESS'],
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'documents without an OperationResponse schema are ignored',
    document: {
      components: {
        schemas: {
          Order: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['OPEN', 'CLOSED'],
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid OperationResponse without a status field',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              state: {
                type: 'string',
                enum: ['QUEUED', 'RUNNING', 'COMPLETE', 'ERROR', 'CANCELLED'],
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-status-must-use-the-standard-status-enum',
        message: MISSING_STATUS_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid status enum with non-standard values',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'SUPERSEDED'],
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-status-must-use-the-standard-status-enum',
        message: STATUS_ENUM_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'status'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid status enum with a missing value',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED'],
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-status-must-use-the-standard-status-enum',
        message: STATUS_ENUM_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'status'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid status field without an enum',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-status-must-use-the-standard-status-enum',
        message: STATUS_ENUM_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'status'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid OperationResponse with an exception',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              state: {
                type: 'string',
              },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-status-must-use-the-standard-status-enum': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'compliant OperationResponse does not need an exception',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED', 'SUPERSEDED'],
              },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-status-must-use-the-standard-status-enum': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-status-must-use-the-standard-status-enum',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'components',
          'schemas',
          'OperationResponse',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-status-must-use-the-standard-status-enum',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
