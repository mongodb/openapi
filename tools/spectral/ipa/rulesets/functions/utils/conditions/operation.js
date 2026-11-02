// @ts-check
// Conditions on a path item (ctx.pathItem) or an operation (ctx.operation) and its extensions.

import { defineCondition } from './registry.js';
import { hasGetMethod } from '../resourceEvaluation.js';
import { hasCustomMethodOverride as hasCustomMethodOverrideExtension, hasMethodVerbOverride } from '../extensions.js';

const withOperation = (operation, note, options = {}) => ({
  path: ['paths', '/groups/{groupId}', 'get'],
  paths: { '/groups/{groupId}': { get: operation } },
  options,
  note,
});

export const hasGet = defineCondition({
  id: 'pathItem.hasGet',
  label: 'the path defines a Get method',
  subject: 'pathItem',
  definition: 'The path item defines a `get` operation.',
  fn: (ctx) => hasGetMethod(ctx.pathItem),
  examples: {
    match: [
      {
        path: ['paths', '/groups/{groupId}/settings'],
        paths: { '/groups/{groupId}/settings': { get: {} } },
        note: 'defines get',
      },
    ],
    noMatch: [
      {
        path: ['paths', '/groups/{groupId}/settings'],
        paths: { '/groups/{groupId}/settings': { patch: {} } },
        note: 'patch only',
      },
    ],
  },
});

export const hasCustomMethodOverride = defineCondition({
  id: 'operation.hasCustomMethodOverride',
  label: 'the operation is declared a custom method by `x-xgen-method-verb-override`',
  subject: 'operation',
  definition:
    'The operation has an `x-xgen-method-verb-override` extension with `customMethod: true`, declaring a legacy custom method that has no `:` in its path.',
  fn: (ctx) => hasCustomMethodOverrideExtension(ctx.operation),
  examples: {
    match: [
      withOperation(
        { 'x-xgen-method-verb-override': { verb: 'search', customMethod: true } },
        'verb override `search` with customMethod: true'
      ),
    ],
    noMatch: [
      withOperation({}, 'no verb override'),
      withOperation(
        { 'x-xgen-method-verb-override': { verb: 'get', customMethod: false } },
        'verb override `get` with customMethod: false'
      ),
    ],
  },
});

export const hasListVerbOverride = defineCondition({
  id: 'operation.hasListVerbOverride',
  label: 'the operation is declared a List method by `x-xgen-method-verb-override`',
  subject: 'operation',
  definition:
    'The operation has an `x-xgen-method-verb-override` extension whose verb starts with `list`, declaring it a List method.',
  fn: (ctx) => hasMethodVerbOverride(ctx.operation, 'list'),
  examples: {
    match: [
      withOperation(
        { 'x-xgen-method-verb-override': { verb: 'listByGroup', customMethod: false } },
        'verb override `listByGroup`'
      ),
    ],
    noMatch: [
      withOperation({ 'x-xgen-method-verb-override': { verb: 'get', customMethod: false } }, 'verb override `get`'),
    ],
  },
});

export const hasRuleMethodVerbOverride = defineCondition({
  id: 'operation.hasRuleMethodVerbOverride',
  label: "the operation is declared the rule's method by `x-xgen-method-verb-override`",
  subject: 'operation',
  definition:
    "The operation has an `x-xgen-method-verb-override` extension whose verb starts with the rule's `methodName` option (for IPA-104, `get`), declaring it that standard method.",
  readsRuleOptions: true,
  fn: (ctx) => hasMethodVerbOverride(ctx.operation, ctx.options.methodName),
  examples: {
    match: [
      withOperation(
        { 'x-xgen-method-verb-override': { verb: 'get', customMethod: false } },
        'verb override `get`, rule methodName `get`',
        { methodName: 'get' }
      ),
    ],
    noMatch: [withOperation({}, 'no verb override, rule methodName `get`', { methodName: 'get' })],
  },
});
