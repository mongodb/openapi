import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-112-field-names-are-camel-case', [
  {
    name: 'valid schema - all field names are camelCase',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              userId: { type: 'string' },
              firstName: { type: 'string' },
              emailAddress: { type: 'string' },
              phoneNumber: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid schema',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              UserId: { type: 'string' },
              user_id: { type: 'string' },
              'user-id': { type: 'string' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "UserId" must use camelCase format.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'UserId'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "user_id" must use camelCase format.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'user_id'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "user-id" must use camelCase format.',
        path: ['components', 'schemas', 'SchemaName', 'properties', 'user-id'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'schema with exception - non-camelCase field with exception',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              'NON-CAMEL-CASE': {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-field-names-are-camel-case': 'Reason',
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
    name: 'mixed valid, invalid, and exception fields',
    document: {
      components: {
        schemas: {
          SchemaName: {
            properties: {
              userId: { type: 'string' },
              'API-Key': {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-field-names-are-camel-case': 'Reason',
                },
              },
              User_Name: {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-field-names-are-camel-case': 'Reason',
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
