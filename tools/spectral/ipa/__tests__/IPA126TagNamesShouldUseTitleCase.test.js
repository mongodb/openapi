import testRule from './__helpers__/testRule.js';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-126-tag-names-should-use-title-case', [
  {
    name: 'valid Title Case tag names',
    document: {
      tags: [
        { name: 'User Management' },
        { name: 'Resource Groups' },
        { name: 'Atlas' },
        { name: 'User Profiles' },
        { name: 'Api' },
        { name: 'Users' },
        { name: 'Resources' },
        { name: 'Projects' },
      ],
    },
    errors: [],
  },
  {
    name: 'invalid camelCase instead of Title Case',
    document: {
      tags: [{ name: 'userManagement' }],
    },
    errors: [
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "userManagement".',
        path: ['tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid kebab-case instead of Title Case',
    document: {
      tags: [{ name: 'user-management' }],
    },
    errors: [
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "user-management".',
        path: ['tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid snake_case instead of Title Case',
    document: {
      tags: [{ name: 'user_management' }],
    },
    errors: [
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "user_management".',
        path: ['tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid all lowercase instead of Title Case',
    document: {
      tags: [{ name: 'user management' }],
    },
    errors: [
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "user management".',
        path: ['tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'invalid ALL UPPERCASE instead of Title Case',
    document: {
      tags: [{ name: 'USER MANAGEMENT' }],
    },
    errors: [
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "USER MANAGEMENT".',
        path: ['tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'mixed cases in multiple tags',
    document: {
      tags: [{ name: 'User Management' }, { name: 'resourceGroups' }, { name: 'API ENDPOINTS' }],
    },
    errors: [
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "resourceGroups".',
        path: ['tags', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "API ENDPOINTS".',
        path: ['tags', '2'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
  {
    name: 'valid with exception',
    document: {
      tags: [
        {
          name: 'legacy_tag',
          'x-xgen-IPA-exception': {
            'xgen-IPA-126-tag-names-should-use-title-case': 'Legacy tag that cannot be changed',
          },
        },
      ],
    },
    errors: [],
  },
  {
    name: 'invalid tag names',
    document: {
      tags: [
        { name: 'Api V1' },
        { name: 'Version 2 Resources' },
        { name: 'Push-Based Log Export' },
        { name: 'AWS Clusters DNS' },
        { name: 'Encryption at Rest using Customer Key Management' },
      ],
    },
    errors: [
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "Api V1".',
        path: ['tags', '0'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "Version 2 Resources".',
        path: ['tags', '1'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "Push-Based Log Export".',
        path: ['tags', '2'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "AWS Clusters DNS".',
        path: ['tags', '3'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-126-tag-names-should-use-title-case',
        message: 'Tag name should use Title Case, found: "Encryption at Rest using Customer Key Management".',
        path: ['tags', '4'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
