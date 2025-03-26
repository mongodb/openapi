import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

const parameters = {
  parameters: {
    includeCount: {
      name: 'includeCount',
      in: 'query',
      schema: {
        type: 'boolean',
        default: true,
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

testRule('xgen-IPA-110-collections-request-includeCount-not-required', [
  {
    name: 'valid',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'includeCount',
                in: 'query',
                schema: {
                  type: 'boolean',
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
                $ref: '#/components/parameters/includeCount',
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
    name: 'valid - includeCount not present',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/itemsPerPage',
              },
            ],
          },
        },
        'resources/{resourceId}': {
          get: {},
        },
      },
      components: parameters,
    },
    errors: [],
  },
  {
    name: 'valid - no parameters at all',
    document: {
      paths: {
        '/resources': {
          get: {},
        },
        'resources/{resourceId}': {
          get: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid - includeCount is required',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'includeCount',
                in: 'query',
                required: true,
                schema: {
                  type: 'boolean',
                },
              },
            ],
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-includeCount-not-required',
        message: 'includeCount query parameter of List method must not be required.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid - referenced includeCount is required',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                $ref: '#/components/parameters/RequiredIncludeCount',
              },
            ],
          },
        },
      },
      components: {
        parameters: {
          RequiredIncludeCount: {
            name: 'includeCount',
            in: 'query',
            required: true,
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-110-collections-request-includeCount-not-required',
        message: 'includeCount query parameter of List method must not be required.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid - handles exception',
    document: {
      paths: {
        '/resources': {
          get: {
            parameters: [
              {
                name: 'includeCount',
                in: 'query',
                required: true,
                schema: {
                  type: 'boolean',
                },
              },
            ],
            'x-xgen-IPA-exception': {
              'xgen-IPA-110-collections-request-includeCount-not-required': 'Reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
