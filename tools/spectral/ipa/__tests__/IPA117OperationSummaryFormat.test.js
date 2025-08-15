import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-operation-summary-format', [
  {
    name: 'valid description',
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
    name: 'invalid descriptions',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            summary: 'Return One Resource.',
          },
        },
        '/resource': {
          get: {
            summary: 'Return all resources',
          },
        },
        '/resource/{id}/child': {
          get: {
            summary: 'return all child resources.',
          },
        },
        '/resource/{id}/child/{id}': {
          get: {
            summary: 'Return **One** Child Resource',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-operation-summary-format',
        message: 'Operation summaries must be in Title Case, must not end with a period and must not use CommonMark.',
        path: ['paths', '/resource/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-operation-summary-format',
        message: 'Operation summaries must be in Title Case, must not end with a period and must not use CommonMark.',
        path: ['paths', '/resource', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-operation-summary-format',
        message: 'Operation summaries must be in Title Case, must not end with a period and must not use CommonMark.',
        path: ['paths', '/resource/{id}/child', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-operation-summary-format',
        message: 'Operation summaries must be in Title Case, must not end with a period and must not use CommonMark.',
        path: ['paths', '/resource/{id}/child/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid description with exceptions',
    document: {
      paths: {
        '/resource/{id}': {
          get: {
            summary: 'Return One Resource.',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-operation-summary-format': 'reason',
            },
          },
        },
        '/resource': {
          get: {
            summary: 'Return all resources',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-operation-summary-format': 'reason',
            },
          },
        },
        '/resource/{id}/child': {
          get: {
            summary: 'return all child resources.',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-operation-summary-format': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
