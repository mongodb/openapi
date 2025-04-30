import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-114-authenticated-endpoints-have-auth-errors', [
  {
    name: 'valid authenticated endpoint with 401 and 403 responses',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: { description: 'Success' },
              401: { description: 'Unauthorized' },
              403: { description: 'Forbidden' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid authenticated endpoint missing both auth error responses',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: { description: 'Success' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-authenticated-endpoints-have-auth-errors',
        message: 'Authenticated endpoint must define a 401 response.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-114-authenticated-endpoints-have-auth-errors',
        message: 'Authenticated endpoint must define a 403 response.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid authenticated endpoint missing 401 response',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: { description: 'Success' },
              403: { description: 'Forbidden' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-authenticated-endpoints-have-auth-errors',
        message: 'Authenticated endpoint must define a 401 response.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid authenticated endpoint missing 403 response',
    document: {
      paths: {
        '/resources': {
          get: {
            responses: {
              200: { description: 'Success' },
              401: { description: 'Unauthorized' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-authenticated-endpoints-have-auth-errors',
        message: 'Authenticated endpoint must define a 403 response.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'unauthenticated endpoint with empty security array',
    document: {
      paths: {
        '/resources': {
          get: {
            security: [],
            responses: {
              200: { description: 'Success' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'unauthenticated endpoint with /unauth in path',
    document: {
      paths: {
        '/unauth/resources': {
          get: {
            responses: {
              200: { description: 'Success' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'unauthenticated endpoint with both /unauth and empty security',
    document: {
      paths: {
        '/unauth/resources': {
          get: {
            security: [],
            responses: {
              200: { description: 'Success' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'edge case with no responses object',
    document: {
      paths: {
        '/resources': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-114-authenticated-endpoints-have-auth-errors',
        message: 'Authenticated endpoint must define a 401 and 403 responses.',
        path: ['paths', '/resources', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
