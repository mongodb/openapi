import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const components = {
  responses: {
    badRequest: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ApiError',
          },
        },
      },
      description: 'Bad Request.',
    },
    notFound: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ApiError',
          },
        },
      },
      description: 'Not Found.',
    },
    internalServerError: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ApiError',
          },
        },
      },
      description: 'Internal Error.',
    },
  },
  schemas: {
    ApiError: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
        },
      },
    },
  },
};

testRule('xgen-IPA-114-error-responses-refer-to-api-error', [
  {
    name: 'valid error responses with ApiError schema',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              400: {
                $ref: '#/components/responses/badRequest',
              },
              404: {
                $ref: '#/components/responses/notFound',
              },
              500: {
                $ref: '#/components/responses/internalServerError',
              },
            },
          },
        },
      },
      components: components,
    },
    errors: [],
  },
  {
    name: 'invalid error responses missing schema',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              400: {
                content: {
                  'application/json': {},
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-error-responses-refer-to-api-error',
        message: '400 response must define a schema referencing ApiError.',
        path: ['paths', '/resources', 'get', 'responses', '400', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid error responses missing content',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              400: {},
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-error-responses-refer-to-api-error',
        message: '400 response must define content with ApiError schema reference.',
        path: ['paths', '/resources', 'get', 'responses', '400'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid error responses referencing wrong schema',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              500: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Error',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-error-responses-refer-to-api-error',
        message: '500 response must reference ApiError schema.',
        path: ['paths', '/resources', 'get', 'responses', '500', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid error responses with inline schema',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              404: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          type: 'string',
                        },
                      },
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
        code: 'xgen-IPA-114-error-responses-refer-to-api-error',
        message: '404 response must reference ApiError schema.',
        path: ['paths', '/resources', 'get', 'responses', '404', 'content', 'application/json'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'error responses with exception',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              400: {
                'x-xgen-IPA-exception': {
                  'xgen-IPA-114-error-responses-refer-to-api-error': 'Reason',
                },
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
              500: {
                description: "Internal Service Error",
                'x-xgen-IPA-exception': {
                  'xgen-IPA-114-error-responses-refer-to-api-error': 'Reason',
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
