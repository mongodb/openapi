import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-117-create-operation-summary-starts-with', [
  {
    name: 'valid summary',
    document: {
      paths: {
        '/resource': {
          post: {
            summary: 'Create One Resource',
          },
        },
        '/projects/{id}/users': {
          post: {
            summary: 'Add One User to One Project',
          },
        },
        '/projects/{id}/users:invite': {
          // Ignores custom method
          post: {
            summary: 'Invite One User to One Project',
          },
        },
        '/projects/{id}/users/invite': {
          // Ignores legacy custom method
          post: {
            summary: 'Invite One User to One Project',
            'x-xgen-method-verb-override': {
              customMethod: true,
            },
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
          post: {
            summary: 'Creating One Resource',
          },
        },
        '/projects/{id}/users': {
          post: {
            summary: 'Adds One User to One Project',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-117-create-operation-summary-starts-with',
        message: 'Operation summary must start with one of the words [Create,Add].',
        path: ['paths', '/resource', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-117-create-operation-summary-starts-with',
        message: 'Operation summary must start with one of the words [Create,Add].',
        path: ['paths', '/projects/{id}/users', 'post'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid summary with exceptions',
    document: {
      paths: {
        '/resource': {
          post: {
            summary: 'Creating One Resource',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-create-operation-summary-starts-with': 'reason',
            },
          },
        },
        '/projects/{id}/users': {
          post: {
            summary: 'Adds One User to One Project',
            'x-xgen-IPA-exception': {
              'xgen-IPA-117-create-operation-summary-starts-with': 'reason',
            },
          },
        },
      },
    },
    errors: [],
  },
]);
