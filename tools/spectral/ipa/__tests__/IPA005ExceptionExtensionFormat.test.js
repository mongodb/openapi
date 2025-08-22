import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-005-exception-extension-format', [
  {
    name: 'valid exceptions',
    document: {
      paths: {
        '/path': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': 'Exception.',
          },
        },
        '/nested': {
          post: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-100-rule-name': 'Exception.',
            },
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid exceptions',
    document: {
      paths: {
        '/path1': {
          'x-xgen-IPA-exception': 'Exception',
        },
        '/path2': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': {
              reason: '',
            },
          },
        },
        '/path3': {
          'x-xgen-IPA-exception': {
            'invalid-rule-name': 'Exception',
          },
        },
        '/path4': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': {},
          },
        },
        '/path5': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-1001-rule-name': {},
          },
        },
        '/path6': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-1001-rule_name': {},
          },
        },
        '/path7': {
          'x-xgen-IPA-exception': {
            'xgen-IPA_100_rule-name': {},
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path1', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a non-empty reason that starts with uppercase and ends with a full stop.',
        path: ['paths', '/path2', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path3', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a non-empty reason that starts with uppercase and ends with a full stop.',
        path: ['paths', '/path4', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path5', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path6', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path7', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
