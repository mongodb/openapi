import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const validDocument = {
  components: {
    schemas: {
      ApiError: {
        properties: {
          badRequestDetail: {
            $ref: '#/components/schemas/BadRequestDetail',
          },
          detail: { type: 'string' },
        },
      },
      BadRequestDetail: {
        properties: {
          fields: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FieldViolation',
            },
          },
        },
      },
      FieldViolation: {
        properties: {
          description: { type: 'string' },
          field: { type: 'string' },
        },
        required: ['description', 'field'],
      },
    },
  },
};

testRule('xgen-IPA-114-api-error-has-bad-request-detail', [
  {
    name: 'valid ApiError schema passes validation',
    document: validDocument,
    errors: [],
  },
  {
    name: 'missing properties in ApiError fails',
    document: {
      components: {
        schemas: {
          ApiError: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-api-error-has-bad-request-detail',
        message: 'ApiError schema must have badRequestDetail field.',
        path: ['components', 'schemas', 'ApiError'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'missing badRequestDetail field fails',
    document: {
      components: {
        schemas: {
          ApiError: {
            properties: {
              detail: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-api-error-has-bad-request-detail',
        message: 'ApiError schema must have badRequestDetail field.',
        path: ['components', 'schemas', 'ApiError'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'badRequestDetail without fields property fails',
    document: {
      components: {
        schemas: {
          ApiError: {
            properties: {
              badRequestDetail: {
                properties: {
                  someOtherProperty: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-api-error-has-bad-request-detail',
        message: 'badRequestDetail must include an array of fields.',
        path: ['components', 'schemas', 'ApiError'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'fields not being an array fails',
    document: {
      components: {
        schemas: {
          ApiError: {
            properties: {
              badRequestDetail: {
                properties: {
                  fields: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-api-error-has-bad-request-detail',
        message: 'badRequestDetail must include an array of fields.',
        path: ['components', 'schemas', 'ApiError'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'missing description or field properties fails',
    document: {
      components: {
        schemas: {
          ApiError: {
            properties: {
              badRequestDetail: {
                properties: {
                  fields: {
                    type: 'array',
                    properties: {
                      // Missing description and field properties
                      otherProperty: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-api-error-has-bad-request-detail',
        message: 'Each field must include description and field properties.',
        path: ['components', 'schemas', 'ApiError'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
