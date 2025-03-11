import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-102-collection-identifier-camelCase', [
  {
    name: 'valid camelCase identifiers',
    document: {
      paths: {
        '/api/v2/atlas/test': {},
        '/users': {},
        '/resourceGroups': {},
        '/userProfiles': {},
        '/api/v1/test': {},
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
    name: 'valid paths with custom methods (only checking identifier part)',
    document: {
      paths: {
        '/resources:any_Custom_Method': {},
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
    name: 'invalid resource path with invalid casing but valid custom method',
    document: {
      paths: {
        '/Resources:createResource': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'Resources' in path '/Resources:createResource' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/Resources:createResource'],
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
  {
    name: 'reports violations for paths with double slashes',
    document: {
      paths: {
        '/api//users': {},
        '/resources///{resourceId}': {},
        '//doubleSlashAtStart': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path '/api//users' contains double slashes (//) which is not allowed. http://go/ipa/102",
        path: ['paths', '/api//users'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path '/resources///{resourceId}' contains double slashes (//) which is not allowed. http://go/ipa/102",
        path: ['paths', '/resources///{resourceId}'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path '//doubleSlashAtStart' contains double slashes (//) which is not allowed. http://go/ipa/102",
        path: ['paths', '//doubleSlashAtStart'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'handles paths with trailing slashes',
    document: {
      paths: {
        '/api/users/': {},
        '/resources/{resourceId}/': {},
      },
    },
    errors: [],
  },
  {
    name: 'detects multiple failures across a single path',
    document: {
      paths: {
        '/API/Resource_groups/{userId}/User-profiles': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'API' in path '/API/Resource_groups/{userId}/User-profiles' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/API/Resource_groups/{userId}/User-profiles'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'Resource_groups' in path '/API/Resource_groups/{userId}/User-profiles' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/API/Resource_groups/{userId}/User-profiles'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'User-profiles' in path '/API/Resource_groups/{userId}/User-profiles' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/API/Resource_groups/{userId}/User-profiles'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'handles mixed valid and invalid segments with custom methods',
    document: {
      paths: {
        '/api/Valid/Invalid_resource/{id}:validCustomMethod': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'Valid' in path '/api/Valid/Invalid_resource/{id}:validCustomMethod' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/api/Valid/Invalid_resource/{id}:validCustomMethod'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'Invalid_resource' in path '/api/Valid/Invalid_resource/{id}:validCustomMethod' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/api/Valid/Invalid_resource/{id}:validCustomMethod'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'handles double slashes with invalid segments - both issues reported',
    document: {
      paths: {
        '/api//Invalid_segment//resources': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path '/api//Invalid_segment//resources' contains double slashes (//) which is not allowed. http://go/ipa/102",
        path: ['paths', '/api//Invalid_segment//resources'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-102-collection-identifier-camelCase',
        message:
          "Collection identifiers must be in camelCase. Path segment 'Invalid_segment' in path '/api//Invalid_segment//resources' is not in camelCase. http://go/ipa/102",
        path: ['paths', '/api//Invalid_segment//resources'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
