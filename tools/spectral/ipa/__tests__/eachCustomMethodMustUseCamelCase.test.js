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
            'xgen-IPA-109-custom-method-must-use-camel-case': {},
          },
        },
        '/b:MethodName': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-109-custom-method-must-use-camel-case': {},
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
        '/a:': {}
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'The custom method name must use camelCase format. Method name: MethodName. http://go/ipa/109',
        path: ['paths', '/a/{exampleId}:MethodName'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'The custom method name must use camelCase format. Method name: MethodName. http://go/ipa/109',
        path: ['paths', '/a:MethodName'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'The custom method name must use camelCase format. Method name: method_name. http://go/ipa/109',
        path: ['paths', '/a/{exampleId}:method_name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'The custom method name must use camelCase format. Method name: method_name. http://go/ipa/109',
        path: ['paths', '/a:method_name'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'Custom method name cannot be empty or blank. http://go/ipa/109',
        path: ['paths', '/a/{exampleId}:'],
        severity: DiagnosticSeverity.Warning,
      },
      {
        code: 'xgen-IPA-109-custom-method-must-use-camel-case',
        message: 'Custom method name cannot be empty or blank. http://go/ipa/109',
        path: ['paths', '/a:'],
        severity: DiagnosticSeverity.Warning,
      },
    ],
  },
]);
