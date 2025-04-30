import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-105-resource-has-list', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/standard': {
          post: {},
          get: {},
        },
        '/standard/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/standard/{exampleId}/nested': {
          post: {},
          get: {},
        },
        '/standard/{exampleId}/nested/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods',
    document: {
      paths: {
        '/standard': {
          post: {},
        },
        '/standard/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/standard/{exampleId}/nested': {
          post: {},
        },
        '/standard/{exampleId}/nested/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-105-resource-has-list',
        message: 'APIs must provide a List method for resources.',
        path: ['paths', '/standard'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-105-resource-has-list',
        message: 'APIs must provide a List method for resources.',
        path: ['paths', '/standard/{exampleId}/nested'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/standard': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-105-resource-has-list': 'reason',
          },
          post: {},
        },
        '/standard/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/standard/{exampleId}/nested': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-105-resource-has-list': 'reason',
          },
          post: {},
        },
        '/standard/{exampleId}/nested/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
      },
    },
    errors: [],
  },
]);
