import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const VALUE_ERROR_MESSAGE = 'The x-xgen-server-computed-immutable extension value must be a boolean.';
const READ_ONLY_ERROR_MESSAGE =
  'A property with the x-xgen-server-computed-immutable extension must also be marked as readOnly: true.';

testRule('xgen-IPA-131-server-computed-immutable', [
  {
    name: 'valid server-computed-immutable extension',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              computed: { type: 'string', readOnly: true, 'x-xgen-server-computed-immutable': true },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid non-boolean value',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              computed: { type: 'string', readOnly: true, 'x-xgen-server-computed-immutable': 'yes' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-131-server-computed-immutable',
        message: VALUE_ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'computed'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid property not marked readOnly',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              computed: { type: 'string', 'x-xgen-server-computed-immutable': true },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-131-server-computed-immutable',
        message: READ_ONLY_ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'computed'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid non-boolean value and not readOnly',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              computed: { type: 'string', 'x-xgen-server-computed-immutable': 0 },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-131-server-computed-immutable',
        message: VALUE_ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'computed'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-131-server-computed-immutable',
        message: READ_ONLY_ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'computed'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid property with exception',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              computed: {
                type: 'string',
                'x-xgen-server-computed-immutable': true,
                'x-xgen-IPA-exception': {
                  'xgen-IPA-131-server-computed-immutable': 'Reason',
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
