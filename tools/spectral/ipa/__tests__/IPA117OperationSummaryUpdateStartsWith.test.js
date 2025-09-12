import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-update-operation-summary-starts-with', [
  {
    name: 'valid summary',
    document: {
      paths: {
        '/resource': {
          patch: {
            summary: 'Update One Resource',
          },
        },
        '/projects/{id}/users': {
          put: {
            summary: 'Update One User in One Project',
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
          patch: {
            summary: 'Modify One Resource',
          },
        },
        '/projects/{id}/users': {
          put: {
            summary: 'Change One User to One Project',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-update-operation-summary-starts-with',
        message: 'Operation summary must start with the word "Update".',
        path: ['paths', '/resource', 'patch'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-117-update-operation-summary-starts-with',
        message: 'Operation summary must start with the word "Update".',
        path: ['paths', '/projects/{id}/users', 'put'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid summary with exceptions',
    document: {
      paths: {
        '/resource': {
          patch: {
            summary: 'Modify One Resource',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-update-operation-summary-starts-with': 'reason',
            },
          },
        },
        '/projects/{id}/users': {
          put: {
            summary: 'Change One User to One Project',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-update-operation-summary-starts-with': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
