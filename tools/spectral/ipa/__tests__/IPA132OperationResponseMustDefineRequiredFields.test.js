import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const validOperationResponse = {
  type: 'object',
  required: ['operationId', 'status', 'operationType', 'createdAt', 'updatedAt', 'expiresAt'],
  properties: {
    operationId: { type: 'string' },
    status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED', 'SUPERSEDED'] },
    operationType: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'CUSTOM'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
  },
};

testRule('xgen-IPA-132-operation-response-must-define-required-fields', [
  {
    name: 'valid OperationResponse with all required fields',
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
    name: 'documents without an OperationResponse schema are ignored',
    document: {
      components: {
        schemas: {
          Order: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid OperationResponse missing required fields',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            required: ['operationType'],
            properties: {
              operationType: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'CUSTOM'] },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    errors: [
      // Results are ordered by document position: the schema-level errors anchor at the schema
      // object, before the property-level errors
      {
        code: 'xgen-IPA-132-operation-response-must-define-required-fields',
        message: 'OperationResponse must define the operationId property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-required-fields',
        message: 'OperationResponse must define the status property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-required-fields',
        message: 'OperationResponse must define the updatedAt property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-required-fields',
        message: 'OperationResponse must define the expiresAt property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-required-fields',
        message: 'The createdAt property must be listed as required.',
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'createdAt'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
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
    name: 'invalid OperationResponse with an exception',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              operationType: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'CUSTOM'] },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-define-required-fields': 'reason',
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
              'xgen-IPA-132-operation-response-must-define-required-fields': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-define-required-fields',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'components',
          'schemas',
          'OperationResponse',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-response-must-define-required-fields',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
