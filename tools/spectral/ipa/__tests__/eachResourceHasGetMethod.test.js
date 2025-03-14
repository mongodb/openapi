import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-104-resource-has-GET', [
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
        '/standard/{exampleId}/nestedSingleton': {
          get: {},
          patch: {},
        },
        '/custom': {
          post: {},
          get: {},
        },
        '/custom/{exampleId}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/custom/{exampleId}:method': {
          post: {},
        },
        '/custom:method': {
          post: {},
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
          get: {},
        },
        '/standard/{exampleId}': {
          patch: {},
          delete: {},
        },
        '/standard/{exampleId}/nested': {
          post: {},
          get: {},
        },
        '/standard/{exampleId}/nested/{exampleId}': {
          patch: {},
          delete: {},
        },
        '/standard/{exampleId}/nestedSingleton': {
          patch: {},
        },
        '/custom': {
          post: {},
          get: {},
        },
        '/custom/{exampleId}': {
          patch: {},
          delete: {},
        },
        '/custom/{exampleId}:method': {
          post: {},
        },
        '/custom:method': {
          post: {},
        },
        '/standardWithoutSubResource': {
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources.',
        path: ['paths', '/standard'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources.',
        path: ['paths', '/standard/{exampleId}/nested'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources.',
        path: ['paths', '/standard/{exampleId}/nestedSingleton'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources.',
        path: ['paths', '/custom'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources.',
        path: ['paths', '/standardWithoutSubResource'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid method with exception',
    document: {
      paths: {
        '/standard': {
          post: {},
          get: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-104-resource-has-GET': 'reason',
          },
        },
        '/standard/{exampleId}': {
          patch: {},
          delete: {},
        },
      },
    },
    errors: [],
  },
]);
