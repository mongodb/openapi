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
  },
};

testRule('xgen-IPA-125-oneOf-no-base-types', [
  {
    name: 'valid oneOf with references only',
    document: {
      components: componentSchemas,
      schemas: {
        Animal: {
          oneOf: [{ $ref: '#/components/schemas/Dog' }, { $ref: '#/components/schemas/Cat' }],
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid oneOf with object schema',
    document: {
      components: componentSchemas,
      schemas: {
        MixedObject: {
          oneOf: [
            {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
            { $ref: '#/components/schemas/Dog' },
          ],
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid oneOf with string type',
    document: {
      components: componentSchemas,
      schemas: {
        MixedType: {
          oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Dog' }],
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-no-base-types',
        message: 'oneOf should not contain base types like integer, number, string, or boolean.',
        path: ['schemas', 'MixedType'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid oneOf with multiple base types',
    document: {
      components: componentSchemas,
      schemas: {
        BaseTypes: {
          oneOf: [{ type: 'string' }, { type: 'integer' }, { type: 'boolean' }],
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-125-oneOf-no-base-types',
        message: 'oneOf should not contain base types like integer, number, string, or boolean.',
        path: ['schemas', 'BaseTypes'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'oneOf with exception',
    document: {
      components: componentSchemas,
      schemas: {
        MixedType: {
          oneOf: [{ type: 'string' }, { type: 'integer' }],
          'x-xgen-IPA-exception': {
            'xgen-IPA-125-oneOf-no-base-types': 'reason for exemption',
          },
        },
      },
    },
    errors: [],
  },
]);
