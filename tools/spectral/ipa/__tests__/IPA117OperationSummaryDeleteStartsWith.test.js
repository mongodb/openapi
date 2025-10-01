import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-delete-operation-summary-starts-with', [
  {
    name: 'valid summary',
    document: {
      paths: {
        '/resource': {
          delete: {
            summary: 'Delete One Resource',
          },
        },
        '/projects/{id}/users': {
          delete: {
            summary: 'Remove One User from One Project',
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
        '/resource': {
          delete: {
            summary: 'Destroy One Resource',
          },
        },
        '/projects/{id}/users': {
          delete: {
            summary: 'Deletes One User from One Project',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-delete-operation-summary-starts-with',
        message: 'Operation summary must start with one of the words [Delete,Remove].',
        path: ['paths', '/resource', 'delete'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-delete-operation-summary-starts-with',
        message: 'Operation summary must start with one of the words [Delete,Remove].',
        path: ['paths', '/projects/{id}/users', 'delete'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid summary with exceptions',
    document: {
      paths: {
        '/resource': {
          delete: {
            summary: 'Destroy One Resource',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-delete-operation-summary-starts-with': 'reason',
            },
          },
        },
        '/projects/{id}/users': {
          delete: {
            summary: 'Deletes One User from One Project',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-delete-operation-summary-starts-with': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
