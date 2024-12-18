import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-005-exception-extension-format', [
  {
    name: 'valid exceptions',
    document: {
      paths: {
        '/path': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': {
              reason: 'Exception',
            },
          },
        },
        '/nested': {
          post: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-100-rule-name': {
                reason: 'Exception',
              },
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
            'xgen-IPA-100-rule-name': 'Exception',
          },
        },
        '/path3': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': {
              reason: '',
            },
          },
        },
        '/path4': {
          'x-xgen-IPA-exception': {
            'invalid-rule-name': {
              reason: 'Exception',
            },
          },
        },
        '/path5': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': {
              wrongKey: 'Exception',
            },
          },
        },
        '/path6': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': {
              reason: 'Exception',
              excessKey: 'Exception',
            },
          },
        },
        '/path7': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': {},
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa/5',
        path: ['paths', '/path1', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa/5',
        path: ['paths', '/path2', 'x-xgen-IPA-exception', 'xgen-IPA-100-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa/5',
        path: ['paths', '/path3', 'x-xgen-IPA-exception', 'xgen-IPA-100-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa/5',
        path: ['paths', '/path4', 'x-xgen-IPA-exception', 'invalid-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa/5',
        path: ['paths', '/path5', 'x-xgen-IPA-exception', 'xgen-IPA-100-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa/5',
        path: ['paths', '/path6', 'x-xgen-IPA-exception', 'xgen-IPA-100-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa/5',
        path: ['paths', '/path7', 'x-xgen-IPA-exception', 'xgen-IPA-100-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
