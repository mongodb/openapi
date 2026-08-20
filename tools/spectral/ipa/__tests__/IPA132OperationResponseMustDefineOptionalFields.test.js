import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const CUSTOM_METHOD_REQUIRED_ERROR_MESSAGE =
  'The customMethod property must not be listed as required. It is present only when operationType is CUSTOM, which cannot be validated statically.';
const ERROR_REQUIRED_ERROR_MESSAGE =
  'The error property must not be listed as required. It is present only when the operation has FAILED, which cannot be validated statically.';

const validOperationResponse = {
  type: 'object',
  properties: {
    customMethod: { type: 'string' },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        retryable: { type: 'boolean' },
      },
    },
    resultHref: { type: 'string', format: 'uri' },
    retryAfterSeconds: { type: 'integer' },
  },
};

testRule('xgen-IPA-132-operation-response-must-define-optional-fields', [
  {
    name: 'valid OperationResponse with all conditional fields',
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
    name: 'invalid OperationResponse missing conditional fields',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
            properties: {
              customMethod: { type: 'string' },
              resultHref: { type: 'string', format: 'uri' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-define-optional-fields',
        message: 'OperationResponse must define the error property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-optional-fields',
        message: 'OperationResponse must define the retryAfterSeconds property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid conditional fields listed as required',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            ...validOperationResponse,
            required: ['customMethod', 'error'],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-define-optional-fields',
        message: CUSTOM_METHOD_REQUIRED_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'customMethod'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-define-optional-fields',
        message: ERROR_REQUIRED_ERROR_MESSAGE,
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
              customMethod: { type: 'string' },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-define-optional-fields': 'reason',
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
              'xgen-IPA-132-operation-response-must-define-optional-fields': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-define-optional-fields',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'components',
          'schemas',
          'OperationResponse',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-response-must-define-optional-fields',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
