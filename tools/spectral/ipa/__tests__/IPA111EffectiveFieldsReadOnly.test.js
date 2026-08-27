import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-111-effective-fields-read-only', [
  {
    name: 'valid effective field with readOnly: true',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              effectiveState: { type: 'string', readOnly: true },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'valid non-effective field without readOnly',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              state: { type: 'string' },
              effective: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid effective field without readOnly',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              effectiveState: { type: 'string' },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-111-effective-fields-read-only',
        message: 'Effective-value fields must be marked as readOnly: true.',
        path: ['components', 'schemas', 'Schema', 'properties', 'effectiveState'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid effective field with readOnly: false',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              effectiveState: { type: 'string', readOnly: false },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-111-effective-fields-read-only',
        message: 'Effective-value fields must be marked as readOnly: true.',
        path: ['components', 'schemas', 'Schema', 'properties', 'effectiveState'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid effective field in request schema',
    document: {
      paths: {
        '/resources': {
          post: {
            requestBody: {
              content: {
                'application/vnd.atlas.2024-01-01+json': {
                  schema: {
                    type: 'object',
                    properties: {
                      effectiveState: { type: 'string', readOnly: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-111-effective-fields-read-only',
        message: 'Effective-value fields represent server-computed state and must not appear in request schemas.',
        path: [
          'paths',
          '/resources',
          'post',
          'requestBody',
          'content',
          'application/vnd.atlas.2024-01-01+json',
          'schema',
          'properties',
          'effectiveState',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid effective field without readOnly - exception',
    document: {
      components: {
        schemas: {
          Schema: {
            type: 'object',
            properties: {
              effectiveState: {
                type: 'string',
                'x-xgen-IPA-exception': {
                  'xgen-IPA-111-effective-fields-read-only': 'Reason',
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
