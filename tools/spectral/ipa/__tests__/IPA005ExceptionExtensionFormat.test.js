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
        '/path-short': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100': 'Exception.',
          },
        },
        '/path-camelCase': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-125-rule-name-camelCase': 'Exception.',
          },
        },
        '/path-numbers': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-117-rule-name-1': 'Exception.',
          },
        },
        '/nested': {
          post: {
            'x-xgen-IPA-exception': {
              'xgen-IPA-100-rule-name': 'Exception.',
              'xgen-IPA-005': 'Short format exception.',
              'xgen-IPA-112-camelCase': 'CamelCase exception.',
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
        '/path8': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100-': 'Exception.',
          },
        },
        '/path9': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-5': 'Exception.',
          },
        },
        '/path10': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100': 'exception without uppercase.',
          },
        },
        '/path11': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-100': 'Exception without period',
          },
        },
      },
    },
    errors: [
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX or xgen-IPA-XXX-{rule-name} format.',
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
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX or xgen-IPA-XXX-{rule-name} format.',
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
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX or xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path5', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX or xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path6', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX or xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path7', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX or xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path8', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a valid key following xgen-IPA-XXX or xgen-IPA-XXX-{rule-name} format.',
        path: ['paths', '/path9', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a non-empty reason that starts with uppercase and ends with a full stop.',
        path: ['paths', '/path10', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-005-exception-extension-format',
        message: 'IPA exceptions must have a non-empty reason that starts with uppercase and ends with a full stop.',
        path: ['paths', '/path11', 'x-xgen-IPA-exception'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
