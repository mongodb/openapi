import testRule from './__helpers__/testRule';
import { DiagnosticSeverity } from '@stoplight/types';

testRule('xgen-IPA-109-custom-method-identifier-format', [
  {
    name: 'valid custom method formats',
    document: {
      paths: {
        '/resource:customMethod': {},
        '/resource/{resourceId}:customMethod': {},
        '/resource/{resourceId}/subresource:customMethod': {},
        '/resource/{resourceId}/subresource/{resourceId}:customMethod': {},
        '/resource/subresource/{resourceId}:customMethod': {},
        '/resource/{resourceId}/subresource/{resourceId}/nested:customMethod': {},
        '/resource/{resourceId}/subresource/{resourceId}/nested/{resourceId}:customMethod': {},
        '/resource/subresource/nested/{resourceId}:customMethod': {},
      },
    },
    errors: [],
  },
  {
    name: 'invalid custom method formats not validated by this rule',
    document: {
      paths: {
        '/resources:custom&method': {},
        '/resources:custom/method': {},
      },
    },
    errors: [],
  },
  {
    name: 'invalid custom method with exception',
    document: {
      paths: {
        '/resources/:customMethod': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-109-custom-method-identifier-format': 'exception reason',
          },
        },
        '/resources:{resourceId}:customMethod': {
          'x-xgen-IPA-exception': {
            'xgen-IPA-109-custom-method-identifier-format': 'exception reason',
          },
        },
      },
    },
    errors: [],
  },
  {
    name: 'invalid custom method formats',
    document: {
      paths: {
        '/resources/:customMethod': {},
        '/resources:{resourceId}:customMethod': {},
        '/resources/:{resourceId}:customMethod': {},
        '/:customMethod': {},
        '/resources/{resourceId}/:customMethod': {},
        '/resources/{resourceId}:custom::Method': {},
      },
    },
    errors: [
      {
        code: 'xgen-IPA-109-custom-method-identifier-format',
        message:
          "The path /resources/:customMethod contains a '/' before a custom method. Custom methods should not start with a '/'.",
        path: ['paths', '/resources/:customMethod'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-identifier-format',
        message: 'Multiple colons found in "/resources:{resourceId}:customMethod"',
        path: ['paths', '/resources:{resourceId}:customMethod'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-identifier-format',
        message: 'Multiple colons found in "/resources/:{resourceId}:customMethod".',
        path: ['paths', '/resources/:{resourceId}:customMethod'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-identifier-format',
        message:
          "The path /:customMethod contains a '/' before a custom method. Custom methods should not start with a '/'.",
        path: ['paths', '/:customMethod'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-identifier-format',
        message:
          "The path /resources/{resourceId}/:customMethod contains a \'/\' before a custom method. Custom methods should not start with a \'/\'.",
        path: ['paths', '/resources/{resourceId}/:customMethod'],
        severity: DiagnosticSeverity.Error,
      },
      {
        code: 'xgen-IPA-109-custom-method-identifier-format',
        message: 'Multiple colons found in "/resources/{resourceId}:custom::Method".',
        path: ['paths', '/resources/{resourceId}:custom::Method'],
        severity: DiagnosticSeverity.Error,
      },
    ],
  },
]);
