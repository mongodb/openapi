import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const validOperationResponse = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        retryable: { type: 'boolean' },
        retryStrategy: { type: 'string', enum: ['IMMEDIATE', 'BACKOFF', 'NONE'] },
        details: { type: 'object' },
      },
    },
  },
};

testRule('xgen-IPA-132-operation-response-must-define-nested-object-structure', [
  {
    name: 'valid OperationResponse with a structured error object',
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
    name: 'valid OperationResponse with a referenced error object',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              error: { $ref: '#/components/schemas/OperationError' },
            },
          },
          OperationError: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              retryable: { type: 'boolean' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'nested objects that are not defined are skipped',
    document: {
      components: {
        schemas: {
          // A missing error field is the optional-fields rule's concern
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
    name: 'invalid error object missing structured properties',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-define-nested-object-structure',
        message: 'The error object must define a message property.',
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'error'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-nested-object-structure',
        message: 'The error object must define a retryable property.',
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'error'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid error modeled as a plain string',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-define-nested-object-structure',
        message: 'The error object must define a code property.',
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'error'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-nested-object-structure',
        message: 'The error object must define a message property.',
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'error'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-nested-object-structure',
        message: 'The error object must define a retryable property.',
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
              error: { type: 'string' },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-define-nested-object-structure': 'reason',
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
              'xgen-IPA-132-operation-response-must-define-nested-object-structure': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-define-nested-object-structure',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'components',
          'schemas',
          'OperationResponse',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-response-must-define-nested-object-structure',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
