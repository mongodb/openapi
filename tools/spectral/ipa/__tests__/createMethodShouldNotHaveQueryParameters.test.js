import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    Schema: {
      type: 'object',
    },
  },
};

testRule('xgen-IPA-106-create-method-should-not-have-query-parameters', [
  {
    name: 'valid methods',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
            parameters: [
              {
                name: 'header-param',
                in: 'header',
                schema: { type: 'string' },
              },
              {
                name: 'resource-id',
                in: 'path',
                schema: {
                  $ref: '#/components/schemas/Schema',
                },
              },
            ],
          },
        },
        '/resource2': {
          post: {
            parameters: [],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
          },
        },
        '/resource2': {
          post: {
            parameters: [
              {
                name: 'header-param',
                in: 'header',
                schema: { type: 'string' },
              },
              {
                name: 'query-param',
                in: 'query',
                schema: {
                  $ref: '#/components/schemas/Schema',
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-106-create-method-should-not-have-query-parameters',
        message: 'Create operations should not have query parameters. http://go/ipa/106',
        path: ['paths', '/resource', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-106-create-method-should-not-have-query-parameters',
        message: 'Create operations should not have query parameters. http://go/ipa/106',
        path: ['paths', '/resource2', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid methods with exceptions',
    document: {
      components: componentSchemas,
      paths: {
        '/resource': {
          post: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-106-create-method-should-not-have-query-parameters': 'Reason',
            },
          },
        },
        '/resource2': {
          post: {
            parameters: [
              {
                name: 'query-param',
                in: 'query',
                schema: {
                  $ref: '#/components/schemas/Schema',
                },
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-106-create-method-should-not-have-query-parameters': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
