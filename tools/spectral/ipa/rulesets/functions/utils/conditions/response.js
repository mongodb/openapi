// @ts-check
// Conditions on a response or media type object. is2xx reads the response code from a path like
// ['paths', <path>, <method>, 'responses', <code>, ...] and isJson the media type from [..., 'content', <mediaType>];
// any other path fails the lint run with an error naming the expected shape.

import { defineCondition } from './registry.js';

/**
 * @param {import('../ruleContext.js').RuleContext} ctx
 * @param {string} expected the path shape the calling condition reads
 * @param {boolean} holds whether ctx.path has that shape
 */
function requirePathShape(ctx, expected, holds) {
  if (!holds) {
    throw new Error(`Condition needs a path like ${expected}, got ${JSON.stringify(ctx.path)}`);
  }
}

const content = (code, mediaType, mediaTypeObject, note) => ({
  path: ['paths', '/groups/{groupId}', 'get', 'responses', code, 'content', mediaType],
  paths: { '/groups/{groupId}': { get: { responses: { [code]: { content: { [mediaType]: mediaTypeObject } } } } } },
  ...(note && { note }),
});

export const is2xx = defineCondition({
  id: 'response.is2xx',
  label: 'the response is a 2xx response',
  subject: 'response',
  definition: 'The response status code starts with `2`.',
  fn: (ctx) => {
    requirePathShape(
      ctx,
      "['paths', <path>, <method>, 'responses', <code>, ...]",
      ctx.path[3] === 'responses' && typeof ctx.path[4] === 'string'
    );
    return ctx.path[4].startsWith('2');
  },
  examples: {
    match: [content('200', 'application/json', {}), content('202', 'application/json', {})],
    noMatch: [content('404', 'application/json', {})],
  },
});

export const hasSchema = defineCondition({
  id: 'mediaType.hasSchema',
  label: 'the media type defines a schema',
  subject: 'mediaType',
  definition: 'The media type object exists and defines a `schema`.',
  fn: (ctx) => Boolean(ctx.node?.schema),
  examples: {
    match: [content('200', 'application/json', { schema: { type: 'object' } }, 'has a schema')],
    noMatch: [content('200', 'application/json', { example: {} }, 'an example but no schema')],
  },
});

export const isJson = defineCondition({
  id: 'mediaType.isJson',
  label: 'the media type is JSON',
  subject: 'mediaType',
  definition: 'The media type ends in `json`, e.g. `application/vnd.atlas.2023-01-01+json`.',
  fn: (ctx) => {
    requirePathShape(ctx, "[..., 'content', <mediaType>]", ctx.path.at(-2) === 'content');
    return ctx.path.at(-1).endsWith('json');
  },
  examples: {
    match: [content('200', 'application/vnd.atlas.2023-01-01+json', {})],
    noMatch: [content('200', 'application/vnd.atlas.2023-01-01+csv', {})],
  },
});
