import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const VALUE_ERROR_MESSAGE = 'The x-xgen-server-computed-when-client-omitted extension value must be a boolean.';
const REQUIRED_ERROR_MESSAGE =
  "A property with the x-xgen-server-computed-when-client-omitted extension must not appear in the schema's required list.";

testRule('xgen-IPA-131-server-computed-when-client-omitted', [
  {
    name: 'valid server-computed-when-client-omitted extension',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string' },
              computed: { type: 'string', 'x-xgen-server-computed-when-client-omitted': true },
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
              computed: { type: 'string', 'x-xgen-server-computed-when-client-omitted': 'yes' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-131-server-computed-when-client-omitted',
        message: VALUE_ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'computed'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid property listed as required',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            required: ['computed'],
            properties: {
              computed: { type: 'string', 'x-xgen-server-computed-when-client-omitted': true },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-131-server-computed-when-client-omitted',
        message: REQUIRED_ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'computed'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid non-boolean value and required',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            required: ['computed'],
            properties: {
              computed: { type: 'string', 'x-xgen-server-computed-when-client-omitted': 1 },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-131-server-computed-when-client-omitted',
        message: VALUE_ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'computed'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-131-server-computed-when-client-omitted',
        message: REQUIRED_ERROR_MESSAGE,
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
            required: ['computed'],
            properties: {
              computed: {
                type: 'string',
                'x-xgen-server-computed-when-client-omitted': true,
                'x-xgen-IPA-exception': {
                  'xgen-IPA-131-server-computed-when-client-omitted': 'Reason',
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
