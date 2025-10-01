import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-get-operation-summary-starts-with', [
  {
    name: 'valid summary',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            summary: 'Return One Resource by ID',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid summaries',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            summary: 'Returns One Resource',
          },
        },
        '/resource': {
          get: {
            summary: 'Get One Resource',
          },
        },
        '/resource/{id}/child': {
          get: {
            summary: 'One Resource Return',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-get-operation-summary-starts-with',
        message: 'Operation summary must start with the word "Return".',
        path: ['paths', '/resource/{id}', 'get'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-get-operation-summary-starts-with',
        message: 'Operation summary must start with the word "Return".',
        path: ['paths', '/resource', 'get'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-get-operation-summary-starts-with',
        message: 'Operation summary must start with the word "Return".',
        path: ['paths', '/resource/{id}/child', 'get'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid summary with exceptions',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            summary: 'Returns One Resource',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-get-operation-summary-starts-with': 'reason',
            },
          },
        },
        '/resource': {
          get: {
            summary: 'Get One Resource',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-get-operation-summary-starts-with': 'reason',
            },
          },
        },
        '/resource/{id}/child': {
          get: {
            summary: 'One Resource Return',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-get-operation-summary-starts-with': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
