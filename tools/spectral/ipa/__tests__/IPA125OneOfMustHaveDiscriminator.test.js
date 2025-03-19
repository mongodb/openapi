import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
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
  },
};

testRule('xgen-IPA-125-oneOf-must-have-discriminator', [
  {
    name: 'valid oneOf with discriminator and matching mapping',
    document: {
      components: componentSchemas,
      schemas: {
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
    errors: [],
  },
  {
    name: 'invalid oneOf with discriminator but mismatched mapping',
    document: {
      components: componentSchemas,
      schemas: {
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
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-must-have-discriminator',
        message:
          'The discriminator mapping must match the oneOf references. Unmatched Discriminator mappings with oneOf references: #/components/schemas/Bird',
        path: ['schemas', 'Animal'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid oneOf without discriminator',
    document: {
      components: componentSchemas,
      schemas: {
        Animal: {
          oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-must-have-discriminator',
        message: 'Each oneOf property must include a discriminator property to define the exact type.',
        path: ['schemas', 'Animal'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'oneOf with discriminator exemption',
    document: {
      components: componentSchemas,
      schemas: {
        Animal: {
          oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
          'x-xgen-IPA-exception': {
            'xgen-IPA-125-oneOf-must-have-discriminator': 'reason for exemption',
          },
        },
      },
    },
    errors: [],
  },
]);
