import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-005-exception-extension-format', [
  {
    name: 'valid exceptions',
    document: {
      paths: {
        '/path': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-rule-name': 'Exception',
          },
        },
        '/nested': {
          post: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-100-rule-name': 'Exception',
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
      },
    },
    errors: [
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa-spectral#IPA-102',
        path: ['paths', '/path1', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa-spectral#IPA-102',
        path: ['paths', '/path2', 'x-xgen-IPA-exception', 'xgen-IPA-100-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa-spectral#IPA-102',
        path: ['paths', '/path3', 'x-xgen-IPA-exception', 'invalid-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid rule name and a reason. http://go/ipa-spectral#IPA-102',
        path: ['paths', '/path4', 'x-xgen-IPA-exception', 'xgen-IPA-100-rule-name'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
