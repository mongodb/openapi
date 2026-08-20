import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const STATUS_ENUM_ERROR_MESSAGE =
  'The status field must use exactly the enum [PENDING, IN_PROGRESS, SUCCEEDED, FAILED, CANCELED, SUPERSEDED].';
const OPERATION_TYPE_ENUM_ERROR_MESSAGE =
  'The operationType field must use exactly the enum [CREATE, UPDATE, DELETE, CUSTOM].';
const RETRY_STRATEGY_ENUM_ERROR_MESSAGE =
  'The retryStrategy field must use exactly the enum [IMMEDIATE, BACKOFF, NONE].';

const validOperationResponse = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED', 'SUPERSEDED'] },
    operationType: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'CUSTOM'] },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        retryable: { type: 'boolean' },
        retryStrategy: { type: 'string', enum: ['IMMEDIATE', 'BACKOFF', 'NONE'] },
      },
    },
  },
};

testRule('xgen-IPA-132-operation-response-must-use-standard-enum-values', [
  {
    name: 'valid OperationResponse with all standard enums',
    document: {
      components: {
        schemas: {
          OperationResponse: validOperationResponse,
        },
      },
    },
    errors: [],
  },
  {
    name: 'enum fields that are not defined are skipped',
    document: {
      components: {
        schemas: {
          // Missing fields are the required-fields and optional-fields rules' concern
          OperationResponse: {
            type: 'object',
            properties: {
              operationId: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'composed schemas are skipped',
    document: {
      components: {
        schemas: {
          // Composition is rejected by the must-not-use-composition rule, so this rule stays silent
          OperationResponse: {
            allOf: [{ type: 'object', properties: { statusMessage: { type: 'string' } } }],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid enums with missing and renamed values',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['QUEUED', 'RUNNING', 'COMPLETE', 'ERROR', 'CANCELLED'] },
              operationType: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE'] },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-use-standard-enum-values',
        message: STATUS_ENUM_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'status'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-use-standard-enum-values',
        message: OPERATION_TYPE_ENUM_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'operationType'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid retryStrategy enum nested in the error object',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  retryStrategy: { type: 'string', enum: ['IMMEDIATE', 'EXPONENTIAL'] },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-use-standard-enum-values',
        message: RETRY_STRATEGY_ENUM_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'error'],
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
              status: { type: 'string', enum: ['QUEUED'] },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-use-standard-enum-values': 'reason',
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
            ...validOperationResponse,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-use-standard-enum-values': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-use-standard-enum-values',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'components',
          'schemas',
          'OperationResponse',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-response-must-use-standard-enum-values',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
