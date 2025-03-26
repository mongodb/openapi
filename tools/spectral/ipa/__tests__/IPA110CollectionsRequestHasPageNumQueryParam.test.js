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

testRule('xgen-IPA-110-collections-request-has-pageNum-query-param', [
  {
    name: 'valid examples',
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
        code: 'xgen-IPA-110-collections-request-has-pageNum-query-param',
        message: 'List method is missing query parameters.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid - missing pageNum parameter',
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
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-has-pageNum-query-param',
        message: 'List method is missing a pageNum query parameter.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-110-collections-request-has-pageNum-query-param',
        message: 'List method is missing a pageNum query parameter.',
        path: ['paths', '/resourcesTwo', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid - pageNum parameter is required',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'pageNum',
                in: 'query',
                required: true,
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
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-has-pageNum-query-param',
        message: 'pageNum query parameter of List method must not be required.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid - pageNum parameter without default value',
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
        code: 'xgen-IPA-110-collections-request-has-pageNum-query-param',
        message: 'pageNum query parameter of List method must have a default value defined.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Warning,
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
                name: 'pageNum',
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
        code: 'xgen-IPA-110-collections-request-has-pageNum-query-param',
        message: 'pageNum query parameter of List method must have a default value of 1.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Warning,
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
                $ref: '#/components/parameters/itemsPerPage',
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-110-collections-request-has-pageNum-query-param': 'Reason',
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
