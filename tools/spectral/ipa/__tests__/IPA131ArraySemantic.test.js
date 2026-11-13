import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const ERROR_MESSAGE =
  'The x-xgen-array-semantic extension must be set to one of list, set, and its carrying property must be type: array.';

testRule('xgen-IPA-131-array-semantic', [
  {
    name: 'valid array-semantic extensions',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              tags: { type: 'array', items: { type: 'string' }, 'x-xgen-array-semantic': 'set' },
              names: { type: 'array', items: { type: 'string' }, 'x-xgen-array-semantic': 'list' },
              untagged: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid array-semantic on non-array property',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              tags: { type: 'string', 'x-xgen-array-semantic': 'set' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-131-array-semantic',
        message: ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'tags'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid array-semantic value',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              tags: { type: 'array', items: { type: 'string' }, 'x-xgen-array-semantic': 'bag' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-131-array-semantic',
        message: ERROR_MESSAGE,
        path: ['components', 'schemas', 'Schema', 'properties', 'tags'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid array-semantic with exception',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              tags: {
                type: 'string',
                'x-xgen-array-semantic': 'set',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-131-array-semantic': 'Reason',
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
