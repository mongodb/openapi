import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const OPERATION_TYPE_ENUM_ERROR_MESSAGE =
  'The operationType field must use exactly the enum [CREATE, UPDATE, DELETE, CUSTOM].';
const CUSTOM_METHOD_MISSING_ERROR_MESSAGE =
  'OperationResponse must define a customMethod property for custom method operations.';
const CUSTOM_METHOD_REQUIRED_ERROR_MESSAGE =
  'The customMethod property must not be listed as required. It is required only when operationType is CUSTOM.';

const validOperationResponse = {
  type: 'object',
  required: ['operationId', 'operationType', 'createdAt', 'updatedAt'],
  properties: {
    operationId: { type: 'string' },
    operationType: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'CUSTOM'] },
    customMethod: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

testRule('xgen-IPA-132-operation-response-must-include-core-metadata', [
  {
    name: 'valid OperationResponse with all core metadata',
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
    name: 'invalid OperationResponse missing core metadata',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            type: 'object',
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
        code: 'xgen-IPA-132-operation-response-must-include-core-metadata',
        message: 'OperationResponse must define the operationId property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-include-core-metadata',
        message: 'OperationResponse must define the updatedAt property.',
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-include-core-metadata',
        message: CUSTOM_METHOD_MISSING_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-include-core-metadata',
        message: 'The operationType property must be listed as required.',
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'operationType'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-response-must-include-core-metadata',
        message: 'The createdAt property must be listed as required.',
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'createdAt'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid operationType enum missing a value',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            ...validOperationResponse,
            properties: {
              ...validOperationResponse.properties,
              operationType: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE'] },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-include-core-metadata',
        message: OPERATION_TYPE_ENUM_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'operationType'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid customMethod listed as required',
    document: {
      components: {
        schemas: {
          OperationResponse: {
            ...validOperationResponse,
            required: ['operationId', 'operationType', 'createdAt', 'updatedAt', 'customMethod'],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-include-core-metadata',
        message: CUSTOM_METHOD_REQUIRED_ERROR_MESSAGE,
        path: ['components', 'schemas', 'OperationResponse', 'properties', 'customMethod'],
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
              operationType: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'CUSTOM'] },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-132-operation-response-must-include-core-metadata': 'reason',
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
              'xgen-IPA-132-operation-response-must-include-core-metadata': 'reason',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-response-must-include-core-metadata',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'components',
          'schemas',
          'OperationResponse',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-response-must-include-core-metadata',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
