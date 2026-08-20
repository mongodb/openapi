import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const COMPOSITION_ERROR_MESSAGE =
  'OperationResponse must define its properties directly, without allOf, oneOf or anyOf composition.';

const flatOperationResponse = {
  type: 'object',
  properties: {
    operationId: { type: 'string' },
    status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED', 'SUPERSEDED'] },
  },
};

testRule('xgen-IPA-132-operation-response-must-not-use-composition', [
  {
    name: 'valid flat OperationResponse',
    document: {
      components: {
        schemas: {
          OperationResponse: flatOperationResponse,
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
    name: 'invalid OperationResponse composed with allOf',
    document: {
      components: {
        schemas: {
          // There is one and only one OperationResponse: composition is not allowed
          OperationResponse: {
            allOf: [{ $ref: '#/components/schemas/OperationMetadata' }, flatOperationResponse],
          },
          OperationMetadata: {
            type: 'object',
            properties: {
              statusMessage: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-not-use-composition',
        message: COMPOSITION_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid OperationResponse composed with oneOf',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            oneOf: [flatOperationResponse],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-not-use-composition',
        message: COMPOSITION_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid OperationResponse composed with anyOf',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            anyOf: [flatOperationResponse],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-not-use-composition',
        message: COMPOSITION_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'an exception for another rule does not suppress the composition violation',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            allOf: [flatOperationResponse],
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-define-required-fields': 'we compose from a base schema',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-not-use-composition',
        message: COMPOSITION_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse'],
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
            allOf: [flatOperationResponse],
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-not-use-composition': 'reason',
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
            ...flatOperationResponse,
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-not-use-composition': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-not-use-composition',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'components',
          'schemas',
          'OperationResponse',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-response-must-not-use-composition',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
