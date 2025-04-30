import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-109-custom-method-must-use-camel-case', [
  {
    name: 'valid methods',
    document: {
      paths: {
        '/a/{exampleId}:methodName': {},
        '/a:methodName': {},
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods with exception',
    document: {
      paths: {
        '/b/{exampleId}:MethodName': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-109-custom-method-must-use-camel-case': 'reason',
          },
        },
        '/b:MethodName': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-109-custom-method-must-use-camel-case': 'reason',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid methods',
    document: {
      paths: {
        '/a/{exampleId}:MethodName': {},
        '/a:MethodName': {},
        '/a/{exampleId}:method_name': {},
        '/a:method_name': {},
        '/a/{exampleId}:': {},
        '/a:': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'MethodName must use camelCase format.',
        path: ['paths', '/a/{exampleId}:MethodName'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'MethodName must use camelCase format.',
        path: ['paths', '/a:MethodName'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'method_name must use camelCase format.',
        path: ['paths', '/a/{exampleId}:method_name'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'method_name must use camelCase format.',
        path: ['paths', '/a:method_name'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'Custom method name cannot be empty or blank.',
        path: ['paths', '/a/{exampleId}:'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'Custom method name cannot be empty or blank.',
        path: ['paths', '/a:'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
