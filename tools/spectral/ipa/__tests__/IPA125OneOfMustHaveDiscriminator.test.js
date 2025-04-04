import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  Dog: {
    type: 'object',
    properties: {
      breed: { type: 'string' },
      age: { type: 'integer' },
    },
  },
  Cat: {
    type: 'object',
    properties: {
      color: { type: 'string' },
      livesLeft: { type: 'integer' },
    },
  },
  Bird: {
    type: 'object',
    properties: {
      species: { type: 'string' },
      wingspan: { type: 'number' },
    },
  },
  Fish: {
    type: 'object',
    properties: {
      species: { type: 'string' },
      waterType: { type: 'string' },
    },
  },
};

testRule('xgen-IPA-125-oneOf-must-have-discriminator', [
  {
    name: 'valid oneOf with discriminator and matching mapping',
    document: {
      components: {
        schemas: {
          ...componentSchemas,
          Animal: {
            oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
            discriminator: {
              propertyName: 'type',
              mapping: {
                dog: '#/components/schemas/Dog',
                cat: '#/components/schemas/Cat',
              },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid oneOf with discriminator but mismatched mapping',
    document: {
      components: {
        schemas: {
          ...componentSchemas,
          Animal: {
            oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
            discriminator: {
              propertyName: 'type',
              mapping: {
                dog: '#/components/schemas/Dog',
                bird: '#/components/schemas/Bird',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-must-have-discriminator',
        message:
          'The discriminator mapping must match the oneOf references. Unmatched Discriminator mappings with oneOf references: #/components/schemas/Bird',
        path: ['components', 'schemas', 'Animal'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid oneOf without discriminator',
    document: {
      components: {
        schemas: {
          ...componentSchemas,
          Animal: {
            oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-must-have-discriminator',
        message: 'The schema has oneOf but no discriminator property.',
        path: ['components', 'schemas', 'Animal'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid oneOf with non-object discriminator',
    document: {
      components: {
        schemas: {
          ...componentSchemas,
          Animal: {
            oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
            discriminator: "I'm a string, not an object!",
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-must-have-discriminator',
        message: 'Discriminator property is not an object.',
        path: ['components', 'schemas', 'Animal'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid oneOf with discriminator but no propertyName',
    document: {
      components: {
        schemas: {
          ...componentSchemas,
          Animal: {
            oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
            discriminator: {
              mapping: {
                dog: '#/components/schemas/Dog',
                cat: '#/components/schemas/Cat',
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-must-have-discriminator',
        message: 'Discriminator has no propertyName defined.',
        path: ['components', 'schemas', 'Animal'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid oneOf with discriminator but no mapping',
    document: {
      components: {
        schemas: {
          ...componentSchemas,
          Animal: {
            oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
            discriminator: {
              propertyName: 'type',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-must-have-discriminator',
        message: 'Discriminator must have a mapping object.',
        path: ['components', 'schemas', 'Animal'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'oneOf with discriminator exemption',
    document: {
      components: {
        schemas: {
          ...componentSchemas,
          Animal: {
            oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
            'x-xgen-IPA-exception': {
              'xgen-IPA-125-oneOf-must-have-discriminator': 'reason for exemption',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
