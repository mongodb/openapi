import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-102-path-alternate-resource-name-path-param', [
  {
    name: 'valid paths - api/atlas/v2',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {
          post: {},
          get: {},
        },
        '/api/atlas/v2/resourceName/{pathParam}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/resourceName1/{pathParam}/resourceName2': {
          post: {},
          get: {},
        },
        '/api/atlas/v2/resourceName1/{pathParam1p}/resourceName2/{pathParam2}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/resourceName/{pathParam}:method': {
          post: {},
        },
        '/api/atlas/v2/custom:method': {
          post: {},
        },
        '/api/atlas/v2': {
          post: {},
        }
      },
    },
    errors: [],
  },
  {
    name: 'valid paths - api/atlas/v2/unauth',
    document: {
      paths: {
        '/api/atlas/v2/unauth/resourceName': {
          post: {},
          get: {},
        },
        '/api/atlas/v2/unauth/resourceName/{pathParam}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/unauth/resourceName1/{pathParam}/resourceName2': {
          post: {},
          get: {},
        },
        '/api/atlas/v2/unauth/resourceName1/{pathParam1p}/resourceName2/{pathParam2}': {
          get: {},
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/unauth/resourceName/{pathParam}:method': {
          post: {},
        },
        '/api/atlas/v2/unauth/custom:method': {
          post: {},
        },
        '/api/atlas/v2/unauth': {
          post: {},
        }
      },
    },
    errors: [],
  },
  {
    name: 'invalid paths - api/atlas/v2',
    document: {
      paths: {
        '/api/atlas/v2/resourceName1/resourceName2': {
          post: {},
          get: {},
        },
        '/api/atlas/v2/resourceName/{pathParam1}/{pathParam2}': {
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/resourceName1/{pathParam1}/resourceName2/resourceName3': {
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/resourceName1/{pathParam1}/resourceName2/{pathParam2}/{pathParam3}': {
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/{pathParam}': {
          post: {},
          get: {},
        },
        '/api/atlas/v2/{pathParam1}/{pathParam2}': {
          post: {},
          get: {},
        }
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/resourceName1/resourceName2'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/resourceName/{pathParam1}/{pathParam2}'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/resourceName1/{pathParam1}/resourceName2/resourceName3'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/resourceName1/{pathParam1}/resourceName2/{pathParam2}/{pathParam3}'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/{pathParam}'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/{pathParam1}/{pathParam2}'],
        severity: DiagnosticSeverity.Warning,
      },
    ]
  },
  {
    name: 'invalid paths - api/atlas/v2/unauth',
    document: {
      paths: {
        '/api/atlas/v2/unauth/resourceName1/resourceName2': {
          post: {},
          get: {},
        },
        '/api/atlas/v2/unauth/resourceName/{pathParam1}/{pathParam2}': {
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/unauth/resourceName1/{pathParam1}/resourceName2/resourceName3': {
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/unauth/resourceName1/{pathParam1}/resourceName2/{pathParam2}/{pathParam3}': {
          patch: {},
          delete: {},
        },
        '/api/atlas/v2/unauth/{pathParam}': {
          post: {},
          get: {},
        },
        '/api/atlas/v2/unauth/{pathParam1}/{pathParam2}': {
          post: {},
          get: {},
        }
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/unauth/resourceName1/resourceName2'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/unauth/resourceName/{pathParam1}/{pathParam2}'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/unauth/resourceName1/{pathParam1}/resourceName2/resourceName3'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/unauth/resourceName1/{pathParam1}/resourceName2/{pathParam2}/{pathParam3}'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/unauth/{pathParam}'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params. http://go/ipa/117',
        path: ['paths', '/api/atlas/v2/unauth/{pathParam1}/{pathParam2}'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
