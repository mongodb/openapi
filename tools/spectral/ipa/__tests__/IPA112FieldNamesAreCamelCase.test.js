import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-112-field-names-are-camel-case', [
  {
    name: 'valid examples',
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
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      firstName: { type: 'string' },
                      lastName: { type: 'string' },
                      emailAddress: { type: 'string' },
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
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
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
    name: 'invalid examples',
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
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      First_Name: { type: 'string' },
                      lastName: { type: 'string' },
                      'Email-Address': { type: 'string' },
                    },
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      First_Name: { type: 'string' },
                      lastName: { type: 'string' },
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
                        First_Name: { type: 'string' },
                        lastName: { type: 'string' },
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
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "First_Name" must use camelCase format.',
        path: [
          'paths',
          '/users',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-01-01+json',
          'schema',
          'properties',
          'First_Name',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "Email-Address" must use camelCase format.',
        path: [
          'paths',
          '/users',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2023-01-01+json',
          'schema',
          'properties',
          'Email-Address',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "First_Name" must use camelCase format.',
        path: [
          'paths',
          '/users',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'First_Name',
        ],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "First_Name" must use camelCase format.',
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
          'First_Name',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'exceptions',
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
      paths: {
        '/users': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2023-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      First_Name: {
                        type: 'string',
                        'x-xgen-IPA-exception': {
                          'xgen-IPA-112-field-names-are-camel-case': 'Reason',
                        },
                      },
                      lastName: { type: 'string' },
                      'Email-Address': {
                        type: 'string',
                        'x-xgen-IPA-exception': {
                          'xgen-IPA-112-field-names-are-camel-case': 'Reason',
                        },
                      },
                    },
                  },
                },
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      First_Name: {
                        type: 'string',
                        'x-xgen-IPA-exception': {
                          'xgen-IPA-112-field-names-are-camel-case': 'Reason',
                        },
                      },
                      lastName: { type: 'string' },
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
    name: 'array schema - valid field names',
    document: {
      components: {
        schemas: {
          ArraySchema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                itemId: { type: 'string' },
                itemName: { type: 'string' },
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'array schema - invalid field names',
    document: {
      components: {
        schemas: {
          ArraySchema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                Item_Id: { type: 'string' },
                'ITEM-NAME': { type: 'string' },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "Item_Id" must use camelCase format.',
        path: ['components', 'schemas', 'ArraySchema', 'items', 'properties', 'Item_Id'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "ITEM-NAME" must use camelCase format.',
        path: ['components', 'schemas', 'ArraySchema', 'items', 'properties', 'ITEM-NAME'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'nested schema - valid field names',
    document: {
      components: {
        schemas: {
          NestedSchema: {
            properties: {
              userId: { type: 'string' },
              userProfile: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  contactInfo: {
                    type: 'object',
                    properties: {
                      emailAddress: { type: 'string' },
                      phoneNumber: { type: 'string' },
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
    name: 'nested schema - invalid field names',
    document: {
      components: {
        schemas: {
          NestedSchema: {
            properties: {
              userId: { type: 'string' },
              userProfile: {
                type: 'object',
                properties: {
                  First_Name: { type: 'string' },
                  lastName: { type: 'string' },
                  contactInfo: {
                    type: 'object',
                    properties: {
                      'Email-Address': { type: 'string' },
                      phoneNumber: { type: 'string' },
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
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "First_Name" must use camelCase format.',
        path: ['components', 'schemas', 'NestedSchema', 'properties', 'userProfile', 'properties', 'First_Name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "Email-Address" must use camelCase format.',
        path: [
          'components',
          'schemas',
          'NestedSchema',
          'properties',
          'userProfile',
          'properties',
          'contactInfo',
          'properties',
          'Email-Address',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'mixed schema with exceptions',
    document: {
      components: {
        schemas: {
          ComplexSchema: {
            properties: {
              userId: { type: 'string' },
              'API-KEY': {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-field-names-are-camel-case': 'Reason',
                },
              },
              userSettings: {
                type: 'object',
                properties: {
                  preferences: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        settingName: { type: 'string' },
                        Setting_Value: {
                          type: 'string',
                          'x-xgen-IPA-exception': {
                            'xgen-IPA-112-field-names-are-camel-case': 'UI requirement',
                          },
                        },
                      },
                    },
                  },
                  'DISPLAY-OPTIONS': {
                    type: 'object',
                    'x-xgen-IPA-exception': {
                      'xgen-IPA-112-field-names-are-camel-case': 'UI requirement',
                    },
                    properties: {
                      theme: { type: 'string' },
                      Color_Scheme: {
                        type: 'string',
                        'x-xgen-IPA-exception': {
                          'xgen-IPA-112-field-names-are-camel-case': 'UI requirement',
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
    errors: [],
  },
  {
    name: 'schema with referenced property and nested objects',
    document: {
      components: {
        schemas: {
          Address: {
            type: 'object',
            properties: {
              State_Name: { type: 'string' },
              zipCode: { type: 'string' },
            },
          },
          User: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              firstName: { type: 'string' },
              Last_Name: { type: 'string' },
              primaryAddress: { $ref: '#/components/schemas/Address' },
              contactInfo: {
                type: 'object',
                properties: {
                  email_address: { type: 'string' },
                  phoneNumber: { type: 'string' },
                },
              },
            },
          },
        },
      },
      paths: {
        '/users/{userId}': {
          get: {
            responses: {
              200: {
                content: {
                  'application/vnd.atlas.2024-01-01+json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        REQUEST_ID: { type: 'string' },
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
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "State_Name" must use camelCase format.',
        path: ['components', 'schemas', 'Address', 'properties', 'State_Name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "Last_Name" must use camelCase format.',
        path: ['components', 'schemas', 'User', 'properties', 'Last_Name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "email_address" must use camelCase format.',
        path: ['components', 'schemas', 'User', 'properties', 'contactInfo', 'properties', 'email_address'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-112-field-names-are-camel-case',
        message: 'Property "REQUEST_ID" must use camelCase format.',
        path: [
          'paths',
          '/users/{userId}',
          'get',
          'responses',
          '200',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'REQUEST_ID',
        ],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'schema with referenced property and exceptions',
    document: {
      components: {
        schemas: {
          ApiSettings: {
            type: 'object',
            properties: {
              API_KEY: {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-112-field-names-are-camel-case': 'Reason',
                },
              },
            },
          },
          UserProfile: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              apiSettings: { $ref: '#/components/schemas/ApiSettings' },
              User_Status: {
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
