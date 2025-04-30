import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const parameters = {
  parameters: {
    pageNum: {
      name: 'pageNum',
      in: 'query',
      schema: {
        type: 'integer',
        default: 1,
      },
    },
    itemsPerPage: {
      name: 'itemsPerPage',
      in: 'query',
      schema: {
        type: 'integer',
        default: 100,
      },
    },
  },
};

testRule('xgen-IPA-110-collections-request-has-itemsPerPage-query-param', [
  {
    name: 'valid examples',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'itemsPerPage',
                in: 'query',
                schema: {
                  type: 'integer',
                  default: 100,
                },
              },
            ],
          },
        },
        'resources/{resourceId}': {
          get: {},
        },
        '/resourcesTwo': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/itemsPerPage',
              },
            ],
          },
        },
        'resourcesTwo/{resourceId}': {
          get: {},
        },
      },
      components: parameters,
    },
    errors: [],
  },
  {
    name: 'invalid - missing parameters',
    document: {
      paths: {
        '/resources': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-has-itemsPerPage-query-param',
        message: 'List method is missing query parameters.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid - missing itemsPerPage parameter',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'pageNum',
                in: 'query',
                schema: {
                  type: 'integer',
                  default: 1,
                },
              },
            ],
          },
        },
        'resources/{resourceId}': {
          get: {},
        },
        '/resourcesTwo': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/pageNum',
              },
            ],
          },
        },
        'resourcesTwo/{resourceId}': {
          get: {},
        },
      },
      components: parameters,
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-has-itemsPerPage-query-param',
        message: 'List method is missing a itemsPerPage query parameter.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-110-collections-request-has-itemsPerPage-query-param',
        message: 'List method is missing a itemsPerPage query parameter.',
        path: ['paths', '/resourcesTwo', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid - itemsPerPage parameter is required',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'itemsPerPage',
                in: 'query',
                required: true,
                schema: {
                  type: 'integer',
                  default: 100,
                },
              },
            ],
          },
        },
        'resources/{resourceId}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-has-itemsPerPage-query-param',
        message: 'itemsPerPage query parameter of List method must not be required.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid - itemsPerPage parameter without default value',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'itemsPerPage',
                in: 'query',
                schema: {
                  type: 'integer',
                },
              },
            ],
          },
        },
        'resources/{resourceId}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-has-itemsPerPage-query-param',
        message: 'itemsPerPage query parameter of List method must have a default value defined.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid - wrong default value',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'itemsPerPage',
                in: 'query',
                schema: {
                  type: 'integer',
                  default: 0,
                },
              },
            ],
          },
        },
        'resources/{resourceId}': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-has-itemsPerPage-query-param',
        message: 'itemsPerPage query parameter of List method must have a default value of 100.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'exception',
    document: {
      paths: {
        '/resourcesTwo': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/pageNum',
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-110-collections-request-has-itemsPerPage-query-param': 'Reason',
            },
          },
        },
        'resourcesTwo/{resourceId}': {
          get: {},
        },
      },
      components: parameters,
    },
    errors: [],
  },
]);
