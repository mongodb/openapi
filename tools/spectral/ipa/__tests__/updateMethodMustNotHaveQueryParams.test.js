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
    QueryParam2: {
      name: 'query-param-2',
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

testRule('xgen-IPA-107-put-must-not-have-query-params', [
  {
    name: 'valid put',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          put: {
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
        '/resource/{id}/singleton': {
          put: {
            parameters: [],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid put',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          put: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
          },
        },
        '/resource/{id}/singleton': {
          put: {
            parameters: [
              {
                name: 'header-param',
                in: 'header',
                schema: { type: 'string' },
              },
              {
                $ref: '#/components/parameters/QueryParam',
              },
              {
                $ref: '#/components/parameters/QueryParam2',
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-put-must-not-have-query-params',
        message: 'Update operations must not have query parameters. Found [filter]. http://go/ipa-spectral#IPA-107',
        path: ['paths', '/resource/{id}', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-put-must-not-have-query-params',
        message:
          'Update operations must not have query parameters. Found [query-param]. http://go/ipa-spectral#IPA-107',
        path: ['paths', '/resource/{id}/singleton', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-put-must-not-have-query-params',
        message:
          'Update operations must not have query parameters. Found [query-param-2]. http://go/ipa-spectral#IPA-107',
        path: ['paths', '/resource/{id}/singleton', 'put'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid put with exceptions',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          put: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-put-must-not-have-query-params': 'Reason',
            },
          },
        },
        '/resource/{id}/singleton': {
          put: {
            parameters: [
              {
                $ref: '#/components/parameters/QueryParam',
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-put-must-not-have-query-params': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);

testRule('xgen-IPA-107-patch-must-not-have-query-params', [
  {
    name: 'valid patch',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          patch: {
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
        '/resource/{id}/singleton': {
          patch: {
            parameters: [],
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid patch',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          patch: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
          },
        },
        '/resource/{id}/singleton': {
          patch: {
            parameters: [
              {
                name: 'header-param',
                in: 'header',
                schema: { type: 'string' },
              },
              {
                $ref: '#/components/parameters/QueryParam',
              },
              {
                $ref: '#/components/parameters/QueryParam2',
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-107-patch-must-not-have-query-params',
        message: 'Update operations must not have query parameters. Found [filter]. http://go/ipa-spectral#IPA-107',
        path: ['paths', '/resource/{id}', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-patch-must-not-have-query-params',
        message:
          'Update operations must not have query parameters. Found [query-param]. http://go/ipa-spectral#IPA-107',
        path: ['paths', '/resource/{id}/singleton', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-107-patch-must-not-have-query-params',
        message:
          'Update operations must not have query parameters. Found [query-param-2]. http://go/ipa-spectral#IPA-107',
        path: ['paths', '/resource/{id}/singleton', 'patch'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid patch with exceptions',
    document: {
      components: componentSchemas,
      paths: {
        '/resource/{id}': {
          patch: {
            parameters: [
              {
                name: 'filter',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-patch-must-not-have-query-params': 'Reason',
            },
          },
        },
        '/resource/{id}/singleton': {
          patch: {
            parameters: [
              {
                $ref: '#/components/parameters/QueryParam',
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-107-patch-must-not-have-query-params': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
