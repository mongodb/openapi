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
              otherField: { type: 'number' }
            }
          }
        }
      }
    },
    errors: []
  },
  {
    name: 'invalid schema - with project field name',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              project: { type: 'string' }
            }
          }
        }
      }
    },
    errors: [
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "project" should be avoided. Consider using "group", "groups", or "groupId" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'project'],
        severity: DiagnosticSeverity.Warning
      }
    ]
  },
  {
    name: 'invalid schema - with projects field name',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              projects: { type: 'array' }
            }
          }
        }
      }
    },
    errors: [
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "projects" should be avoided. Consider using "group", "groups", or "groupId" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'projects'],
        severity: DiagnosticSeverity.Warning
      }
    ]
  },
  {
    name: 'invalid schema - with projectId field name',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              projectId: { type: 'string' }
            }
          }
        }
      }
    },
    errors: [
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "projectId" should be avoided. Consider using "group", "groups", or "groupId" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'projectId'],
        severity: DiagnosticSeverity.Warning
      }
    ]
  },
  {
    name: 'invalid schema - with different case variants',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              Project: { type: 'string' },
              PROJECTID: { type: 'string' }
            }
          }
        }
      }
    },
    errors: [
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "Project" should be avoided. Consider using "group", "groups", or "groupId" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'Project'],
        severity: DiagnosticSeverity.Warning
      },
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "PROJECTID" should be avoided. Consider using "group", "groups", or "groupId" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'PROJECTID'],
        severity: DiagnosticSeverity.Warning
      }
    ]
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
                  'xgen-IPA-112-avoid-project-field-names': 'reason'
                }
              }
            }
          }
        }
      }
    },
    errors: []
  },
  {
    name: 'field name containing project substring',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              myProjectDetails: { type: 'object' }
            }
          }
        }
      }
    },
    errors: [
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "myProjectDetails" should be avoided. Consider using "group", "groups", or "groupId" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'myProjectDetails'],
        severity: DiagnosticSeverity.Warning
      }
    ]
  },
  {
    name: 'exception - field with project substring',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              myProjectDetails: {
                type: 'object',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-avoid-project-field-names': 'Legacy field name that cannot be changed'
                }
              }
            }
          }
        }
      }
    },
    errors: []
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
                  'xgen-IPA-112-avoid-project-field-names': 'External API compatibility'
                }
              },
              projects: {
                type: 'array',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-avoid-project-field-names': 'External API compatibility'
                }
              }
            }
          }
        }
      }
    },
    errors: []
  },
  {
    name: 'mixed valid, invalid, and exception fields',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              project: {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-avoid-project-field-names': 'Legacy field'
                }
              },
              projectId: { type: 'string' },
              group: { type: 'string' }
            }
          }
        }
      }
    },
    errors: [
      {
        code: 'xgen-IPA-112-avoid-project-field-names',
        message: 'Field name "projectId" should be avoided. Consider using "group", "groups", or "groupId" instead.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'projectId'],
        severity: DiagnosticSeverity.Warning
      }
    ]
  }
]);