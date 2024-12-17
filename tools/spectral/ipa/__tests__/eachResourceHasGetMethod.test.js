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
        '/singleton': {
          get: {},
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
        '/singleton': {
          patch: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources. http://go/ipa/104',
        path: ['paths', '/standard'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources. http://go/ipa/104',
        path: ['paths', '/standard/{exampleId}/nested'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources. http://go/ipa/104',
        path: ['paths', '/standard/{exampleId}/nestedSingleton'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources. http://go/ipa/104',
        path: ['paths', '/custom'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-104-resource-has-GET',
        message: 'APIs must provide a get method for resources. http://go/ipa/104',
        path: ['paths', '/singleton'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
