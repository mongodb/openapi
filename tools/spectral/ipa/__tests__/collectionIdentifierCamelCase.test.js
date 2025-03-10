import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-102-collection-identifier-camelCase', [
  {
    name: 'valid camelCase identifiers',
    document: {
      paths: {
        '/resources': {},
        '/users': {},
        '/resourceGroups': {},
        '/userProfiles': {},
      },
    },
    errors: [],
  },
  {
    name: 'valid camelCase with path parameters',
    document: {
      paths: {
        '/resourceGroups/{groupId}': {},
        '/users/{userId}/userProfiles': {},
      },
    },
    errors: [],
  },
  {
    name: 'valid camelCase custom methods',
    document: {
      paths: {
        '/resources:createResource': {},
        '/users/{userId}/data/:activateUser': {},
      },
    },
    errors: [],
  },
  {
    name: 'invalid PascalCase instead of camelCase',
    document: {
      paths: {
        '/Resources': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'Resources' in path '/Resources' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/Resources'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with snake_case instead of camelCase',
    document: {
      paths: {
        '/resource_groups': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'resource_groups' in path '/resource_groups' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/resource_groups'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with kebab-case instead of camelCase',
    document: {
      paths: {
        '/resource-groups': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'resource-groups' in path '/resource-groups' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/resource-groups'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid custom method not in camelCase',
    document: {
      paths: {
        '/resources:CREATE_RESOURCE': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Custom method 'CREATE_RESOURCE' in path '/resources:CREATE_RESOURCE' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/resources:CREATE_RESOURCE'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid with consecutive uppercase letters',
    document: {
      paths: {
        '/resourcesAPI': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'resourcesAPI' in path '/resourcesAPI' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/resourcesAPI'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid with path-level exception',
    document: {
      paths: {
        '/resource_groups': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-102-collection-identifier-camelCase': 'Legacy API path that cannot be changed',
          },
        },
      },
    },
    errors: [],
  },
]);
