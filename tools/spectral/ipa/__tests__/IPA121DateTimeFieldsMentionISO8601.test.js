import testRule from './__helpers__/testRule.js';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-121-date-time-fields-mention-iso-8601', [
  {
    name: 'valid when date-time format mentions ISO 8601 in description',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'The creation timestamp in ISO 8601 format in UTC.',
              },
              updatedOn: {
                type: 'string',
                format: 'date-time',
                description: 'When the resource was last updated. Uses ISO 8601 datetime format in UTC.',
              },
            },
          },
        },
        parameters: {
          TestParameter: {
            name: 'createdAt',
            in: 'query',
            description: 'The creation timestamp in ISO 8601 format in UTC.',
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid with non-date-time format',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              username: {
                type: 'string',
                description: 'The username for login.',
              },
              age: {
                type: 'integer',
                description: 'Age in years.',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid when date-time format has no description',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              modifiedAt: {
                type: 'string',
                format: 'date-time',
                description: 'The modification timestamp.',
              },
            },
          },
        },
        parameters: {
          TestParameter: {
            name: 'createdAt',
            in: 'query',
            description: 'The creation timestamp',
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
      paths: {
        '/resources': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      $ref: '#/components/schemas/TestSchema',
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
        code: 'xgen-IPA-121-date-time-fields-mention-iso-8601',
        message:
          'API producers must use ISO 8601 date-time format in UTC for all timestamps. Fields must note ISO 8601 and UTC in their description.',
        path: ['components', 'schemas', 'TestSchema', 'properties', 'createdAt'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-121-date-time-fields-mention-iso-8601',
        message:
          'API producers must use ISO 8601 date-time format in UTC for all timestamps. Fields must note ISO 8601 and UTC in their description.',
        path: ['components', 'schemas', 'TestSchema', 'properties', 'modifiedAt'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-121-date-time-fields-mention-iso-8601',
        message:
          'API producers must use ISO 8601 date-time format in UTC for all timestamps. Fields must note ISO 8601 and UTC in their description.',
        path: ['components', 'parameters', 'TestParameter'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'exception',
    document: {
      components: {
        schemas: {
          TestSchema: {
            properties: {
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'The creation timestamp.',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-121-date-time-fields-mention-iso-8601': 'Legacy field format',
                },
              },
            },
          },
        },
        parameters: {
          TestParameter: {
            name: 'createdAt',
            in: 'query',
            description: 'The creation timestamp',
            schema: {
              type: 'string',
              format: 'date-time',
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-121-date-time-fields-mention-iso-8601': 'Legacy field format',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'test with parameters in path operation',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'since',
                in: 'query',
                description: 'Filter resources created since this ISO 8601 timestamp in UTC',
                schema: {
                  type: 'string',
                  format: 'date-time',
                },
              },
              {
                name: 'until',
                in: 'query',
                description: 'Filter resources created until this timestamp', // Missing ISO 8601 and UTC
                schema: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-121-date-time-fields-mention-iso-8601',
        message:
          'API producers must use ISO 8601 date-time format in UTC for all timestamps. Fields must note ISO 8601 and UTC in their description.',
        path: ['paths', '/resources', 'get', 'parameters', '1'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'test with requestBody properties',
    document: {
      paths: {
        '/resources': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    properties: {
                      scheduledFor: {
                        type: 'string',
                        format: 'date-time',
                        description: 'When to schedule the job using ISO 8601 format in UTC.',
                      },
                      expiresAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'When this resource expires.', // Missing ISO 8601 and UTC
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
        code: 'xgen-IPA-121-date-time-fields-mention-iso-8601',
        message:
          'API producers must use ISO 8601 date-time format in UTC for all timestamps. Fields must note ISO 8601 and UTC in their description.',
        path: [
          'paths',
          '/resources',
          'post',
          'requestBody',
          'content',
          'application/json',
          'schema',
          'properties',
          'expiresAt',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
