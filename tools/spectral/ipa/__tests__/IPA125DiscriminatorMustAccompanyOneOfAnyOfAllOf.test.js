import testRule from './__helpers__/testRule.js';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-125-discriminator-must-accompany-oneOf-anyOf-allOf', [
  {
    name: 'valid schemas',
    document: {
      components: {
        schemas: {
          SchemaOneOf: {
            discriminator: {
              propertyName: 'type',
            },
            oneOf: [{}],
          },
          SchemaAnyOf: {
            discriminator: {
              propertyName: 'type',
            },
            anyOf: [{}],
          },
          SchemaAllOf: {
            discriminator: {
              propertyName: 'type',
            },
            allOf: [{}],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid schemas',
    document: {
      components: {
        schemas: {
          Schema: {
            discriminator: {
              propertyName: 'type',
            },
            properties: {
              type: {
                type: 'string',
              },
            },
          },
          NestedSchema: {
            properties: {
              name: {
                type: 'object',
                discriminator: {
                  propertyName: 'first',
                },
                properties: {
                  first: {
                    type: 'string',
                  },
                },
              },
              address: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-discriminator-must-accompany-oneOf-anyOf-allOf',
        message: "Each discriminator property must be accompanied by a 'oneOf', 'anyOf' or 'allOf' property.",
        path: ['components', 'schemas', 'Schema', 'discriminator'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-125-discriminator-must-accompany-oneOf-anyOf-allOf',
        message: "Each discriminator property must be accompanied by a 'oneOf', 'anyOf' or 'allOf' property.",
        path: ['components', 'schemas', 'NestedSchema', 'properties', 'name', 'discriminator'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid schemas with exceptions',
    document: {
      components: {
        schemas: {
          Schema: {
            discriminator: {
              propertyName: 'type',
            },
            properties: {
              type: {
                type: 'string',
              },
            },
            'x-xgen-IPA-exception': {
              'xgen-IPA-125-discriminator-must-accompany-oneOf-anyOf-allOf': 'reason',
            },
          },
          NestedSchema: {
            properties: {
              name: {
                type: 'object',
                discriminator: {
                  propertyName: 'first',
                },
                properties: {
                  first: {
                    type: 'string',
                  },
                },
                'x-xgen-IPA-exception': {
                  'xgen-IPA-125-discriminator-must-accompany-oneOf-anyOf-allOf': 'reason',
                },
              },
              address: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
]);
