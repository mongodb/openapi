import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const componentSchemas = {
  schemas: {
    Schema: {
      type: 'object',
    },
  },
  parameters: {
    QueryParam: {
      name: 'query-param',
      in: 'query',
      schema: {
        type: 'string',
      },
    },
    PathParam: {
      name: 'resource-id',
      in: 'path',
      schema: {
        type: 'string',
      },
    },
    envelope: {
      name: 'envelope',
      in: 'query',
    },
    pretty: {
      name: 'pretty',
      in: 'query',
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
              {
                $ref: '#/components/parameters/PathParam',
              },
              {
                $ref: '#/components/parameters/envelope',
              },
              {
                $ref: '#/components/parameters/pretty',
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
                $ref: '#/components/parameters/QueryParam',
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
                $ref: '#/components/parameters/QueryParam',
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
