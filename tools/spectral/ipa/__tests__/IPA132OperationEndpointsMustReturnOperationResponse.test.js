import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const SINGLE_OPERATION_ERROR_MESSAGE = 'The Operation endpoint must return the OperationResponse schema.';
const OPERATIONS_COLLECTION_ERROR_MESSAGE =
  'The Operations collection endpoint must return a paginated response whose results reference the OperationResponse schema.';
const MISSING_SCHEMA_ERROR_MESSAGE = 'The Operations endpoint must define a JSON response schema.';

const components = {
  schemas: {
    OperationResponse: {
      type: 'object',
      properties: {
        operationId: { type: 'string' },
      },
    },
    PaginatedOperationResponse: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: { $ref: '#/components/schemas/OperationResponse' },
        },
        totalCount: { type: 'integer' },
      },
    },
    Order: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
    PaginatedOrderResponse: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: { $ref: '#/components/schemas/Order' },
        },
      },
    },
    PaginatedMetadata: {
      type: 'object',
      properties: {
        totalCount: { type: 'integer' },
      },
    },
    // A wrapper composed with allOf is rejected: the IPA-110 pagination rules require the
    // results array to be defined directly on the wrapper schema
    PaginatedAllOfOperationResponse: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedMetadata' },
        {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: { $ref: '#/components/schemas/OperationResponse' },
            },
          },
        },
      ],
    },
    ApiError: {
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
  responses: {
    OperationResponseOk: {
      description: 'Operation status.',
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: { $ref: '#/components/schemas/OperationResponse' },
        },
      },
    },
    OrderOk: {
      description: 'An order.',
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: { $ref: '#/components/schemas/Order' },
        },
      },
    },
  },
};

const operationResponseGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: { $ref: '#/components/schemas/OperationResponse' },
        },
      },
    },
  },
};

const operationResponseGetWithNotFound = {
  responses: {
    ...operationResponseGet.responses,
    404: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: { $ref: '#/components/schemas/ApiError' },
        },
      },
    },
  },
};

const paginatedOperationResponseGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: { $ref: '#/components/schemas/PaginatedOperationResponse' },
        },
      },
    },
  },
};

const paginatedAllOfOperationResponseGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: { $ref: '#/components/schemas/PaginatedAllOfOperationResponse' },
        },
      },
    },
  },
};

// Inline paginated wrappers are rejected, consistent with xgen-IPA-110-collections-use-paginated-prefix
const inlinePaginatedOperationResponseGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: {
            type: 'object',
            properties: {
              results: {
                type: 'array',
                items: { $ref: '#/components/schemas/OperationResponse' },
              },
            },
          },
        },
      },
    },
  },
};

const operationResponseArrayGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/OperationResponse' },
          },
        },
      },
    },
  },
};

const orderGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: { $ref: '#/components/schemas/Order' },
        },
      },
    },
  },
};

const paginatedOrderResponseGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: { $ref: '#/components/schemas/PaginatedOrderResponse' },
        },
      },
    },
  },
};

const inlineSchemaGet = {
  responses: {
    200: {
      content: {
        'application/vnd.atlas.2024-08-05+json': {
          schema: {
            type: 'object',
            properties: {
              operationId: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

testRule('xgen-IPA-132-operation-endpoints-must-return-operation-response', [
  {
    name: 'valid Operations endpoints returning OperationResponse',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: paginatedOperationResponseGet,
        },
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: operationResponseGetWithNotFound,
        },
        '/api/atlas/v2/resourceName/{pathParam}/operations': {
          get: paginatedOperationResponseGet,
        },
        // The response may be defined as a reference to a shared component response
        '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}': {
          get: {
            responses: {
              200: { $ref: '#/components/responses/OperationResponseOk' },
            },
          },
        },
        // Not an Operations endpoint, the returned schema is not restricted
        '/api/atlas/v2/resourceName/{pathParam}': {
          get: orderGet,
        },
      },
      components,
    },
    errors: [],
  },
  {
    name: 'invalid single Operation endpoint returning the parent resource',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: orderGet,
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: SINGLE_OPERATION_ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations/{operationId}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid single Operation endpoint with an inline schema',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: inlineSchemaGet,
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: SINGLE_OPERATION_ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations/{operationId}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid single Operation endpoint referencing a shared non-Operation response',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: {
            responses: {
              200: { $ref: '#/components/responses/OrderOk' },
            },
          },
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: SINGLE_OPERATION_ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}', 'get', 'responses', '200'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations endpoint without a JSON response schema',
    document: {
      paths: {
        // No content at all
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: {
            responses: {
              200: { description: 'Operation status.' },
            },
          },
        },
        // A JSON media type without a schema
        '/api/atlas/v2/resourceName/operations': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {},
                },
              },
            },
          },
        },
        // Only non-JSON media types
        '/api/atlas/v2/resourceName/{pathParam}/operations': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+gzip': {
                    schema: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: MISSING_SCHEMA_ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}', 'get', 'responses', '200'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: MISSING_SCHEMA_ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: MISSING_SCHEMA_ERROR_MESSAGE,
        path: ['paths', '/api/atlas/v2/resourceName/{pathParam}/operations', 'get', 'responses', '200'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations collection returning a non-Operation paginated response',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: paginatedOrderResponseGet,
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: OPERATIONS_COLLECTION_ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid single Operation endpoint returning an array of OperationResponse',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: operationResponseArrayGet,
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: SINGLE_OPERATION_ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations/{operationId}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations collection with an inline paginated wrapper',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: inlinePaginatedOperationResponseGet,
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: OPERATIONS_COLLECTION_ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations collection with an allOf-composed paginated wrapper',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: paginatedAllOfOperationResponseGet,
        },
      },
      components,
    },
    errors: [
      // The IPA-110 pagination rules require the results array directly on the wrapper schema,
      // so an allOf-composed wrapper would fail xgen-IPA-110-collections-response-define-results-array
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: OPERATIONS_COLLECTION_ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid Operations collection returning an unpaginated OperationResponse',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations': {
          get: operationResponseGet,
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: OPERATIONS_COLLECTION_ERROR_MESSAGE,
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-08-05+json',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid responses with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: { $ref: '#/components/schemas/Order' },
                  },
                },
                'x-xgen-IPA-exception': {
                  'xgen-IPA-132-operation-endpoints-must-return-operation-response': 'reason',
                },
              },
            },
          },
        },
      },
      components,
    },
    errors: [],
  },
  {
    name: 'compliant responses do not need an exception',
    document: {
      paths: {
        '/api/atlas/v2/resourceName/operations/{operationId}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-08-05+json': {
                    schema: { $ref: '#/components/schemas/OperationResponse' },
                  },
                },
                'x-xgen-IPA-exception': {
                  'xgen-IPA-132-operation-endpoints-must-return-operation-response': 'reason',
                },
              },
            },
          },
        },
      },
      components,
    },
    errors: [
      {
        code: 'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        message: 'This component adopts the rule and does not need an exception. Please remove the exception.',
        path: [
          'paths',
          '/api/atlas/v2/resourceName/operations/{operationId}',
          'get',
          'responses',
          '200',
          'x-xgen-IPA-exception',
          'xgen-IPA-132-operation-endpoints-must-return-operation-response',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
