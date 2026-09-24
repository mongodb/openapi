// @ts-check
// Conditions on a resource: the path items that belong to it (ctx.resourcePathItems, see getResourcePathItems),
// e.g. '/groups/{groupId}/clusters', '/groups/{groupId}/clusters/{clusterName}' and their custom methods.

import { allOf, anyOf, defineCondition, not } from './registry.js';
import { isCollection, isInstance } from './path.js';
import {
  anyPathHasException,
  getResponseIsAllReadOnly,
  isSingleResourceIdentifier,
  isSingletonResource,
  stripCustomMethodName,
} from '../resourceEvaluation.js';
import { isInvalidGetMethod } from '../methodLogic.js';
import { getGETMethodResponseSchemaFromPathItem } from '../methodUtils.js';

const readOnlyGet = { get: { responses: { 200: { content: { 'application/json': { schema: readOnlySchema() } } } } } };
const writableGet = {
  get: {
    responses: { 200: { content: { 'application/json': { schema: { properties: { name: { type: 'string' } } } } } } },
  },
};

function readOnlySchema() {
  return { properties: { id: { type: 'string', readOnly: true } } };
}

const example = (resourcePath, paths) => ({ path: ['paths', resourcePath], paths });

export const hasSingletonShape = defineCondition({
  id: 'resource.hasSingletonShape',
  subject: 'resource',
  definition:
    "The resource's path items contain exactly one collection path, that path belongs to a parent resource (`/parent/{id}/child`), it has no Create (POST) method, and every other path is a custom method. The current path is not required to be the collection path; see `resource.isSingleton`.",
  fn: (ctx) => isSingletonResource(ctx.resourcePathItems),
  examples: {
    match: [example('/groups/{groupId}/settings', { '/groups/{groupId}/settings': { get: {}, patch: {} } })],
    noMatch: [
      example('/groups/{groupId}/clusters', {
        '/groups/{groupId}/clusters': { get: {}, post: {} },
        '/groups/{groupId}/clusters/{clusterName}': { get: {} },
      }),
      example('/settings', { '/settings': { get: {} } }),
    ],
  },
});

export const isSingleton = defineCondition({
  id: 'resource.isSingleton',
  subject: 'resource',
  definition: 'The path is a collection path and the resource it names has the singleton shape.',
  of: allOf(isCollection, hasSingletonShape),
  examples: {
    match: [
      example('/groups/{groupId}/settings', {
        '/groups/{groupId}/settings': { get: {} },
        '/groups/{groupId}/settings:reset': { post: {} },
      }),
    ],
    noMatch: [
      example('/groups/{groupId}/settings:reset', {
        '/groups/{groupId}/settings': { get: {} },
        '/groups/{groupId}/settings:reset': { post: {} },
      }),
    ],
  },
});

export const hasResourceHasGetException = defineCondition({
  id: 'resource.hasResourceHasGetException',
  subject: 'resource',
  definition: 'Some path item of the resource carries an `x-xgen-IPA-exception` for `xgen-IPA-104-resource-has-GET`.',
  fn: (ctx) => anyPathHasException(ctx.resourcePathItems, 'xgen-IPA-104-resource-has-GET'),
  examples: {
    match: [
      example('/groups/{groupId}/settings', {
        '/groups/{groupId}/settings': { 'x-xgen-IPA-exception': { 'xgen-IPA-104-resource-has-GET': 'reason' } },
      }),
    ],
    noMatch: [example('/groups/{groupId}/settings', { '/groups/{groupId}/settings': { ...readOnlyGet } })],
  },
});

export const getResponseAllReadOnly = defineCondition({
  id: 'resource.getResponseIsAllReadOnly',
  subject: 'resource',
  definition:
    "Every property of the 2xx response schema of the resource's Get method is `readOnly: true`. The Get on the instance path is used if there is one; otherwise the first path with a Get, which may be a List, in which case `results.items` is inspected.",
  fn: (ctx) => getResponseIsAllReadOnly(ctx.resourcePathItems),
  examples: {
    match: [example('/groups/{groupId}/settings', { '/groups/{groupId}/settings': { ...readOnlyGet } })],
    noMatch: [example('/groups/{groupId}/settings', { '/groups/{groupId}/settings': { ...writableGet } })],
  },
});

export const isReadOnly = defineCondition({
  id: 'resource.isReadOnly',
  subject: 'resource',
  definition:
    'The resource has a Get method whose response is entirely read-only, and no path of the resource has an exception for `xgen-IPA-104-resource-has-GET`.',
  divergence:
    'The exception clause is not part of the IPA definition: a resource with an IPA-104 resource-has-GET exception is never read-only, whatever its Get response looks like.',
  of: allOf(not(hasResourceHasGetException), getResponseAllReadOnly),
  examples: {
    match: [example('/groups/{groupId}/settings', { '/groups/{groupId}/settings': { ...readOnlyGet } })],
    noMatch: [
      example('/groups/{groupId}/settings', {
        '/groups/{groupId}/settings': {
          ...readOnlyGet,
          'x-xgen-IPA-exception': { 'xgen-IPA-104-resource-has-GET': 'reason' },
        },
      }),
    ],
  },
});

export const isGetTarget = defineCondition({
  id: 'path.isGetTarget',
  subject: 'path',
  definition: 'The path is where a standard Get method belongs: an instance path, or the path of a singleton resource.',
  of: anyOf(isInstance, isSingleton),
  examples: {
    match: [
      example('/groups/{groupId}', { '/groups/{groupId}': { get: {} } }),
      example('/groups/{groupId}/settings', { '/groups/{groupId}/settings': { get: {} } }),
    ],
    noMatch: [
      example('/groups', { '/groups': { get: {}, post: {} }, '/groups/{groupId}': { get: {} } }),
      example('/groups/settings/{name}', { '/groups/settings/{name}': { get: {} } }),
    ],
  },
});

export const isLegacyGetTarget = defineCondition({
  id: 'path.isLegacyGetTarget',
  subject: 'path',
  variantOf: 'path.isGetTarget',
  definition:
    'The path ends in a path parameter (its last character is `}`), or is the path of a singleton resource. Implemented by `methodLogic.isInvalidGetMethod`.',
  divergence:
    'Accepts any path ending in `}`, including ones that are not instance paths such as `/groups/settings/{name}`. Used by the IPA-104 operation ID rules; the other IPA-104 rules use `path.isGetTarget`.',
  fn: (ctx) => !isInvalidGetMethod(ctx.resourcePath, ctx.resourcePathItems),
  examples: {
    match: [
      example('/groups/{groupId}', { '/groups/{groupId}': { get: {} } }),
      example('/groups/settings/{name}', { '/groups/settings/{name}': { get: {} } }),
    ],
    noMatch: [example('/groups', { '/groups': { get: {}, post: {} }, '/groups/{groupId}': { get: {} } })],
  },
});

/**
 * The 200 response of the Get method of the resource a custom method belongs to, for the current media type, in the
 * document the rule reads. Shared by the condition below and the rule's check.
 *
 * @param {import('../ruleContext.js').RuleContext} ctx a context whose path ends in a media type
 * @returns {{schema?: Object}|null|undefined}
 */
export function baseGetResponse(ctx) {
  return ctx.memo('baseGetResponse', () => {
    const basePathItem = ctx.oas.paths[stripCustomMethodName(ctx.resourcePath)];
    return basePathItem && getGETMethodResponseSchemaFromPathItem(basePathItem, ctx.path.at(-1));
  });
}

export const baseGetHasMediaType = defineCondition({
  id: 'mediaType.baseGetHasMediaType',
  subject: 'mediaType',
  definition:
    'The resource the custom method belongs to (its path without `:<name>`) has a Get method with a 200 response for the same media type as the current response.',
  fn: (ctx) => Boolean(baseGetResponse(ctx)),
  examples: {
    match: [
      {
        path: ['paths', '/groups/{groupId}/settings:reset', 'post', 'responses', '200', 'content', 'application/json'],
        paths: {
          '/groups/{groupId}/settings': { get: { responses: { 200: { content: { 'application/json': {} } } } } },
        },
      },
    ],
    noMatch: [
      {
        path: ['paths', '/groups/{groupId}/settings:reset', 'post', 'responses', '200', 'content', 'application/json'],
        paths: { '/groups/{groupId}/settings': { patch: {} } },
      },
    ],
  },
});

/**
 * The instance path of the resource at the current path, e.g. '/groups/{groupId}' for '/groups'. Undefined when the
 * resource has no instance path.
 *
 * @param {import('../ruleContext.js').RuleContext} ctx
 * @returns {string|undefined}
 */
export function instancePath(ctx) {
  return ctx.memo('instancePath', () => Object.keys(ctx.resourcePathItems).find((p) => isSingleResourceIdentifier(p)));
}
