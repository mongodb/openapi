import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-operation-summary-single-item-wording', [
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
        '/resource1/{id}': {
          get: {
            summary: 'Return One Resource for the Provided Group',
          },
        },
        '/resource2/{id}': {
          get: {
            summary: 'Return the Specified Resource by ID',
          },
        },
        '/resource3/{id}': {
          get: {
            summary: 'Return a Resource by ID',
          },
        },
        '/resource4/{id}': {
          get: {
            summary: 'Return a Resource for the Provided Group',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-operation-summary-single-item-wording',
        message: 'Operation summary referring to a single item must use "one" instead of "provided".',
        path: ['paths', '/resource1/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-operation-summary-single-item-wording',
        message: 'Operation summary referring to a single item must use "one" instead of "specified".',
        path: ['paths', '/resource2/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-operation-summary-single-item-wording',
        message: 'Operation summary referring to a single item must use "one" instead of "a".',
        path: ['paths', '/resource3/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-operation-summary-single-item-wording',
        message: 'Operation summary referring to a single item must use "one" instead of "a".',
        path: ['paths', '/resource4/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-operation-summary-single-item-wording',
        message: 'Operation summary referring to a single item must use "one" instead of "provided".',
        path: ['paths', '/resource4/{id}', 'get'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid summary with exceptions',
    document: {
      paths: {
        '/resource1/{id}': {
          get: {
            summary: 'Return One Resource for the Provided Group',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-operation-summary-single-item-wording': 'reason',
            },
          },
        },
        '/resource2/{id}': {
          get: {
            summary: 'Return the Specified Resource by ID',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-operation-summary-single-item-wording': 'reason',
            },
          },
        },
        '/resource3/{id}': {
          get: {
            summary: 'Return a Resource by ID',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-operation-summary-single-item-wording': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
