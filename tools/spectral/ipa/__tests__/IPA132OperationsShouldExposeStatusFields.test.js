import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const progress = {
  type: 'object',
  properties: {
    completed: { type: 'number' },
    total: { type: 'number' },
    unit: { type: 'string' },
  },
};

const operationResponseWithStatusFields = {
  type: 'object',
  properties: {
    statusMessage: { type: 'string' },
    progress,
    estimatedCompletionTime: { type: 'string', format: 'date-time' },
  },
};

testRule('xgen-IPA-132-operations-should-expose-status-fields', [
  {
    name: 'valid OperationResponse with all status fields',
    document: {
      components: {
        schemas: {
          OperationResponse: operationResponseWithStatusFields,
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid OperationResponse composed with allOf',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            allOf: [{ $ref: '#/components/schemas/OperationMetadata' }, operationResponseWithStatusFields],
          },
          OperationMetadata: {
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
    name: 'invalid OperationResponse without any status fields',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              status: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-should-expose-status-fields',
        message: 'OperationResponse should define a statusMessage property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operations-should-expose-status-fields',
        message: 'OperationResponse should define a progress property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operations-should-expose-status-fields',
        message: 'OperationResponse should define a estimatedCompletionTime property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid progress object missing a field',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            ...operationResponseWithStatusFields,
            properties: {
              ...operationResponseWithStatusFields.properties,
              progress: {
                type: 'object',
                properties: {
                  completed: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-should-expose-status-fields',
        message: 'The progress object should define a unit property.',
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'progress'],
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
              status: { type: 'string' },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operations-should-expose-status-fields': 'reason',
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
            ...operationResponseWithStatusFields,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operations-should-expose-status-fields': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operations-should-expose-status-fields',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'components',
          'schemas',
          'OperationResponse',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operations-should-expose-status-fields',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
