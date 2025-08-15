import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-102-path-alternate-resource-name-path-param', [
  {
    name: 'valid paths - api/atlas/v2',
    document: {
      paths: {
        '/api/atlas/v2/resourceName': {},
        '/api/atlas/v2/resourceName/{pathParam}': {},
        '/api/atlas/v2/resourceName1/{pathParam}/resourceName2': {},
        '/api/atlas/v2/resourceName1/{pathParam1p}/resourceName2/{pathParam2}': {},
        '/api/atlas/v2/resourceName/{pathParam}:method': {},
        '/api/atlas/v2/custom:method': {},
        '/api/atlas/v2': {},
      },
    },
    errors: [],
  },
  {
    name: 'valid paths - api/atlas/v2/unauth',
    document: {
      paths: {
        '/api/atlas/v2/unauth/resourceName': {},
        '/api/atlas/v2/unauth/resourceName/{pathParam}': {},
        '/api/atlas/v2/unauth/resourceName1/{pathParam}/resourceName2': {},
        '/api/atlas/v2/unauth/resourceName1/{pathParam1p}/resourceName2/{pathParam2}': {},
        '/api/atlas/v2/unauth/resourceName/{pathParam}:method': {},
        '/api/atlas/v2/unauth/custom:method': {},
        '/api/atlas/v2/unauth': {},
      },
    },
    errors: [],
  },
  {
    name: 'invalid paths - api/atlas/v2',
    document: {
      paths: {
        '/api/atlas/v2/resourceName1/resourceName2': {},
        '/api/atlas/v2/resourceName/{pathParam1}/{pathParam2}': {},
        '/api/atlas/v2/resourceName1/{pathParam1}/resourceName2/resourceName3': {},
        '/api/atlas/v2/resourceName1/{pathParam1}/resourceName2/{pathParam2}/{pathParam3}': {},
        '/api/atlas/v2/{pathParam}': {},
        '/api/atlas/v2/{pathParam1}/{pathParam2}': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/resourceName1/resourceName2'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/resourceName/{pathParam1}/{pathParam2}'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/resourceName1/{pathParam1}/resourceName2/resourceName3'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/resourceName1/{pathParam1}/resourceName2/{pathParam2}/{pathParam3}'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/{pathParam}'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/{pathParam1}/{pathParam2}'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid paths - api/atlas/v2/unauth',
    document: {
      paths: {
        '/api/atlas/v2/unauth/resourceName1/resourceName2': {},
        '/api/atlas/v2/unauth/resourceName/{pathParam1}/{pathParam2}': {},
        '/api/atlas/v2/unauth/resourceName1/{pathParam1}/resourceName2/resourceName3': {},
        '/api/atlas/v2/unauth/resourceName1/{pathParam1}/resourceName2/{pathParam2}/{pathParam3}': {},
        '/api/atlas/v2/unauth/{pathParam}': {},
        '/api/atlas/v2/unauth/{pathParam1}/{pathParam2}': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/unauth/resourceName1/resourceName2'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/unauth/resourceName/{pathParam1}/{pathParam2}'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/unauth/resourceName1/{pathParam1}/resourceName2/resourceName3'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/unauth/resourceName1/{pathParam1}/resourceName2/{pathParam2}/{pathParam3}'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/unauth/{pathParam}'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/unauth/{pathParam1}/{pathParam2}'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid paths with exceptions',
    document: {
      paths: {
        '/api/atlas/v2/unauth/resourceName1/resourceName2': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-102-path-alternate-resource-name-path-param': 'reason',
          },
        },
        '/api/atlas/v2/resourceName/{pathParam1}/{pathParam2}': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-102-path-alternate-resource-name-path-param': 'reason',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'child paths inherit parent exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName1/resourceName2': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-102-path-alternate-resource-name-path-param': 'parent exception reason',
          },
        },
        '/api/atlas/v2/resourceName1/resourceName2/child': {},
        '/api/atlas/v2/resourceName1/resourceName2/child/{id}': {},
      },
    },
    errors: [],
  },
]);
