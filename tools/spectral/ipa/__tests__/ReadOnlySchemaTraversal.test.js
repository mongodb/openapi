import { DiagnosticSeverity } from '@stoplight/types';
import testRule from './__helpers__/testRule';
import { documentForResponseSchema, listResponseCases, readOnlySchemaCases } from './__helpers__/readOnlySchemaCases';

const singletonPath = '/resource/{exampleId}/singleton';
const resourceCases = [
  ...readOnlySchemaCases,
  ...listResponseCases,
  ...['allOf', 'anyOf', 'oneOf'].map((composition) => ({
    description: `a referenced list response wrapped in ${composition}`,
    schema: { [composition]: [{ $ref: '#/components/schemas/ListResponse' }] },
    expected: false,
  })),
];

const singletonRule = 'xgen-IPA-113-singleton-should-have-update-method';
testRule(
  singletonRule,
  resourceCases.map(({ description, schema, expected }) => ({
    name: `singleton with ${description}`,
    document: documentForResponseSchema(schema, singletonPath),
    errors: expected
      ? []
      : [
          {
            code: singletonRule,
            message: 'Singleton resources should define the Update method.',
            path: ['paths', singletonPath],
            severity: DiagnosticSeverity.Error,
          },
        ],
  }))
);

const updateRule = 'xgen-IPA-107-readonly-resource-should-not-have-update-method';
testRule(
  updateRule,
  resourceCases.map(({ description, schema, expected }) => ({
    name: `PATCH on a singleton with ${description}`,
    document: documentForResponseSchema(schema, singletonPath, { patch: {} }),
    errors: expected
      ? [
          {
            code: updateRule,
            message: 'Read-only resources must not define the Update method.',
            path: ['paths', singletonPath, 'patch'],
            severity: DiagnosticSeverity.Error,
          },
        ]
      : [],
  }))
);

const resetRule = 'xgen-IPA-113-reset-method-not-on-readonly-singleton';
testRule(
  resetRule,
  resourceCases.map(({ description, schema, expected }) => {
    const document = documentForResponseSchema(schema, singletonPath);
    document.paths[`${singletonPath}:reset`] = { post: {} };
    return {
      name: `reset on a singleton with ${description}`,
      document,
      errors: expected
        ? [
            {
              code: resetRule,
              message: 'Read-only singleton resources must not define a :reset custom method.',
              path: ['paths', `${singletonPath}:reset`],
              severity: DiagnosticSeverity.Error,
            },
          ]
        : [],
    };
  })
);

const operationRule = 'xgen-IPA-132-operation-must-be-a-read-only-resource';
const operationPath = '/resource/{exampleId}/operations/{operationId}';
testRule(
  operationRule,
  readOnlySchemaCases.map(({ description, schema, expected }) => ({
    name: `Operation response with ${description}`,
    document: documentForResponseSchema(schema, operationPath),
    errors: expected
      ? []
      : [
          {
            code: operationRule,
            message: 'The Operation resource must be read-only.',
            path: ['paths', operationPath, 'get'],
            severity: DiagnosticSeverity.Warning,
          },
        ],
  }))
);
