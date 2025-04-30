import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-102-collection-identifier-pattern', [
  {
    name: 'valid collection identifiers',
    document: {
      paths: {
        '/resources': {},
        '/users': {},
        '/resourceGroups': {},
        '/api/v2/customers/payments': {},
      },
    },
    errors: [],
  },
  {
    name: 'valid with path parameters',
    document: {
      paths: {
        '/resources/{id}': {},
        '/users/{userId}/profiles': {},
      },
    },
    errors: [],
  },
  {
    name: 'valid with custom methods',
    document: {
      paths: {
        '/resources:create': {},
        '/users/{userId}:activate': {},
      },
    },
    errors: [],
  },
  {
    name: 'invalid starts with uppercase',
    document: {
      paths: {
        '/Resources': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-pattern',
        message:
          "Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers (/[a-z][a-zA-Z0-9]*/). Path segment 'Resources' in path '/Resources' doesn't match the required pattern.",
        path: ['paths', '/Resources'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'invalid with special characters',
    document: {
      paths: {
        '/resource-groups': {},
        '/user_profiles': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-pattern',
        message:
          "Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers (/[a-z][a-zA-Z0-9]*/). Path segment 'resource-groups' in path '/resource-groups' doesn't match the required pattern.",
        path: ['paths', '/resource-groups'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-102-collection-identifier-pattern',
        message:
          "Collection identifiers must begin with a lowercase letter and contain only ASCII letters and numbers (/[a-z][a-zA-Z0-9]*/). Path segment 'user_profiles' in path '/user_profiles' doesn't match the required pattern.",
        path: ['paths', '/user_profiles'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
  {
    name: 'valid with path-level exception',
    document: {
      paths: {
        '/resource-groups': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-102-collection-identifier-pattern': 'Legacy API path that cannot be changed',
          },
        },
      },
    },
    errors: [],
  },
]);
