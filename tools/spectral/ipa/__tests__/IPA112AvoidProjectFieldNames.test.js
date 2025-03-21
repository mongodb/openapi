import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-112-avoid-project-field-names', [
  {
    name: 'valid schema - no project field names',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              group: { type: 'string' },
              groupId: { type: 'string' },
              projection: { type: 'number' },
              gcpProjectId: { type: 'string' },
              somethingWithGcpProjectId: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      group: { type: 'string' },
                      groupId: { type: 'string' },
                      gcpProjectId: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        group: { type: 'string' },
                        gcpProjectId: { type: 'string' },
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
    errors: [],
  },
  {
    name: 'invalid schema - with project field name',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              project: { type: 'string' },
              projects: { type: 'array' },
              projectId: { type: 'string' },
              myProjectDetails: { type: 'object' },
            },
          },
        },
      },
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      projectId: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              201: {
                content: {
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        projectId: { type: 'string' },
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
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "project" should be avoided. Consider using "group" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'project'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "projects" should be avoided. Consider using "groups" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'projects'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "projectId" should be avoided. Consider using "group" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'projectId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "myProjectDetails" should be avoided. Consider using "group" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'myProjectDetails'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "projectId" should be avoided. Consider using "group" instead.',
        path: [
          'paths',
          '/users',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'projectId',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "projectId" should be avoided. Consider using "group" instead.',
        path: [
          'paths',
          '/users',
          'post',
          'responses',
          '201',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'projectId',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid schema with exception - project field name with exception',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              project: {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-avoid-project-field-names': 'reason',
                },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'exception - multiple project fields',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              projectId: {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-avoid-project-field-names': 'Reason',
                },
              },
              projects: {
                type: 'array',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-avoid-project-field-names': 'Reason',
                },
              },
              myProjectDetails: {
                type: 'object',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-avoid-project-field-names': 'Reason',
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
