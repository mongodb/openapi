import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-109-custom-method-must-be-GET-or-POST', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/a/{exampleId}:method': {
          post: {},
        },
        '/a:method': {
          post: {},
        },
        '/b/{exampleId}:method': {
          get: {},
        },
        '/b:method': {
          get: {},
        },
        '/c/{exampleId}:method': {
          get: {},
          'x-xgen-IPA-exception': {},
        },
        '/c:method': {
          get: {},
          'x-xgen-IPA-exception': {},
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods with exception',
    document: {
      paths: {
        '/d/{exampleId}:method': {
          get: {},
          post: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-109-custom-method-must-be-GET-or-POST' : {}
          },
        },
        '/d:method': {
          get: {},
          post: {},
          'x-xgen-IPA-exception': {
            'xgen-IPA-109-custom-method-must-be-GET-or-POST' : {}
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods',
    document: {
      paths: {
        '/a/{exampleId}:method': {
          put: {},
        },
        '/a:method': {
          put: {},
        },
        '/b/{exampleId}:method': {
          get: {},
          put: {},
        },
        '/b:method': {
          get: {},
          put: {},
        },
        '/c/{exampleId}:method': {
          post: {},
          get: {},
          put: {},
        },
        '/c:method': {
          post: {},
          get: {},
          put: {},
        },
        '/d/{exampleId}:method': {
          post: {},
          get: {},
        },
        '/d:method': {
          post: {},
          get: {},
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-custom-method-must-be-GET-or-POST',
        message: 'The HTTP method for custom methods must be GET or POST. http://go/ipa/109',
        path: ['paths', '/a/{exampleId}:method'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-be-GET-or-POST',
        message: 'The HTTP method for custom methods must be GET or POST. http://go/ipa/109',
        path: ['paths', '/a:method'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-be-GET-or-POST',
        message: 'The HTTP method for custom methods must be GET or POST. http://go/ipa/109',
        path: ['paths', '/b/{exampleId}:method'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-be-GET-or-POST',
        message: 'The HTTP method for custom methods must be GET or POST. http://go/ipa/109',
        path: ['paths', '/b:method'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-be-GET-or-POST',
        message: 'The HTTP method for custom methods must be GET or POST. http://go/ipa/109',
        path: ['paths', '/c/{exampleId}:method'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-be-GET-or-POST',
        message: 'The HTTP method for custom methods must be GET or POST. http://go/ipa/109',
        path: ['paths', '/c:method'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-be-GET-or-POST',
        message: 'The HTTP method for custom methods must be GET or POST. http://go/ipa/109',
        path: ['paths', '/d/{exampleId}:method'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-be-GET-or-POST',
        message: 'The HTTP method for custom methods must be GET or POST. http://go/ipa/109',
        path: ['paths', '/d:method'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
