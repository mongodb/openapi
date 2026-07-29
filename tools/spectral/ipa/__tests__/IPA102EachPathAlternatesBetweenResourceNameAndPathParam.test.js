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
    name: 'valid paths - IPA-132 Operations endpoints',
    document: {
      paths: {
        // Collection-scoped Operations endpoints, nested directly under the parent collection
        '/api/atlas/v2/resourceName/operations': {},
        '/api/atlas/v2/resourceName/operations/{operationId}': {},
        '/api/atlas/v2/resourceName1/{pathParam}/resourceName2/operations': {},
        '/api/atlas/v2/resourceName1/{pathParam}/resourceName2/operations/{operationId}': {},
        '/api/atlas/v2/unauth/resourceName/operations': {},
        '/api/atlas/v2/unauth/resourceName/operations/{operationId}': {},
        // Instance-scoped Operations endpoints, nested under the parent resource instance
        '/api/atlas/v2/resourceName/{pathParam}/operations': {},
        '/api/atlas/v2/resourceName/{pathParam}/operations/{operationId}': {},
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
    name: 'invalid paths - only a trailing Operations suffix is exempt',
    document: {
      paths: {
        // `operations` is only exempt as the final segment, optionally followed by its path param
        '/api/atlas/v2/resourceName/operations/foo': {},
        '/api/atlas/v2/resourceName/operations/{operationId}/details': {},
        // A non-alternating segment which is not `operations` is still a violation
        '/api/atlas/v2/resourceName/customAction': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/resourceName/operations/foo'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/resourceName/operations/{operationId}/details'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message: 'API paths must alternate between resource name and path params.',
        path: ['paths', '/api/atlas/v2/resourceName/customAction'],
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
  {
    name: 'child paths have exceptions along with parent exceptions',
    document: {
      paths: {
        '/api/atlas/v2/resourceName1/resourceName2': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-102-path-alternate-resource-name-path-param': 'parent exception reason',
          },
        },
        '/api/atlas/v2/resourceName1/resourceName2/child': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-102-path-alternate-resource-name-path-param': 'child exception reason',
          },
        },
        '/api/atlas/v2/resourceName1/resourceName2/child/{id}': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-102-path-alternate-resource-name-path-param': 'child exception reason',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message:
          'This component adopts the rule and does not need an exception. Please remove the exception. https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-102-path-alternate-resource-name-path-param',
        path: [
          'paths',
          '/api/atlas/v2/resourceName1/resourceName2/child',
          'x-xgen-IPA-exception',
          'xgen-IPA-102-path-alternate-resource-name-path-param',
        ],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-path-alternate-resource-name-path-param',
        message:
          'This component adopts the rule and does not need an exception. Please remove the exception. https://mdb.link/mongodb-atlas-openapi-validation#xgen-IPA-102-path-alternate-resource-name-path-param',
        path: [
          'paths',
          '/api/atlas/v2/resourceName1/resourceName2/child/{id}',
          'x-xgen-IPA-exception',
          'xgen-IPA-102-path-alternate-resource-name-path-param',
        ],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
