// @ts-check
// Conditions on a response or media type object, for rules whose path is
// ['paths', <path>, <method>, 'responses', <code>, 'content', <mediaType>].

import { defineCondition } from './registry.js';

const content = (code, mediaType, mediaTypeObject) => ({
  path: ['paths', '/groups/{groupId}', 'get', 'responses', code, 'content', mediaType],
  paths: { '/groups/{groupId}': { get: { responses: { [code]: { content: { [mediaType]: mediaTypeObject } } } } } },
});

export const is2xx = defineCondition({
  id: 'response.is2xx',
  subject: 'response',
  definition: 'The response status code starts with `2`.',
  fn: (ctx) => ctx.path[4].startsWith('2'),
  examples: {
    match: [content('200', 'application/json', {}), content('202', 'application/json', {})],
    noMatch: [content('404', 'application/json', {})],
  },
});

export const hasSchema = defineCondition({
  id: 'mediaType.hasSchema',
  subject: 'mediaType',
  definition: 'The media type object exists and defines a `schema`.',
  fn: (ctx) => Boolean(ctx.node?.schema),
  examples: {
    match: [content('200', 'application/json', { schema: { type: 'object' } })],
    noMatch: [content('200', 'application/json', { example: {} })],
  },
});

export const isJson = defineCondition({
  id: 'mediaType.isJson',
  subject: 'mediaType',
  definition: 'The media type ends in `json`, e.g. `application/vnd.atlas.2023-01-01+json`.',
  fn: (ctx) => ctx.path.at(-1).endsWith('json'),
  examples: {
    match: [content('200', 'application/vnd.atlas.2023-01-01+json', {})],
    noMatch: [content('200', 'application/vnd.atlas.2023-01-01+csv', {})],
  },
});
