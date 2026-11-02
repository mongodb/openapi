// @ts-check
// Conditions on the path string alone (ctx.resourcePath, e.g. '/api/atlas/v2/groups/{groupId}/clusters').
// The /api/atlas/v2 and /api/atlas/v2/unauth prefixes are ignored.

import { defineCondition } from './registry.js';
import {
  isCustomMethodIdentifier,
  isResetMethod,
  isResourceCollectionIdentifier,
  isSingleResourceIdentifier,
} from '../resourceEvaluation.js';

const at = (resourcePath) => ({ path: ['paths', resourcePath] });

export const isCollection = defineCondition({
  id: 'path.isCollection',
  label: 'the path is a resource collection path',
  subject: 'path',
  definition:
    'The path ends in a resource name: either a single top-level segment (`/groups`) or a segment following a path parameter (`/groups/{groupId}/clusters`). This is the path of a resource collection or of a singleton resource.',
  fn: (ctx) => isResourceCollectionIdentifier(ctx.resourcePath),
  examples: {
    match: [at('/api/atlas/v2/groups'), at('/api/atlas/v2/groups/{groupId}/clusters')],
    noMatch: [
      at('/api/atlas/v2/groups/{groupId}'),
      at('/api/atlas/v2/groups/clusters'),
      at('/api/atlas/v2/groups:search'),
    ],
  },
});

export const isInstance = defineCondition({
  id: 'path.isInstance',
  label: 'the path is a single resource (instance) path',
  subject: 'path',
  definition:
    'The path is a collection path (see `path.isCollection`) followed by a single path parameter, e.g. `/groups/{groupId}`. This is the path of one resource in a collection.',
  fn: (ctx) => isSingleResourceIdentifier(ctx.resourcePath),
  examples: {
    match: [at('/api/atlas/v2/groups/{groupId}'), at('/api/atlas/v2/groups/{groupId}/clusters/{clusterName}')],
    noMatch: [
      at('/api/atlas/v2/groups'),
      at('/api/atlas/v2/groups/{groupId}/clusters'),
      at('/api/atlas/v2/groups/settings/{name}'),
    ],
  },
});

export const isCustomMethod = defineCondition({
  id: 'path.isCustomMethod',
  label: 'the path is a custom method',
  subject: 'path',
  definition:
    'The path contains `:`, e.g. `/groups/{groupId}:migrate`. Custom methods declared by the `x-xgen-method-verb-override` extension are not detected (see `operation.hasCustomMethodOverride`).',
  fn: (ctx) => isCustomMethodIdentifier(ctx.resourcePath),
  examples: {
    match: [at('/api/atlas/v2/groups/{groupId}:migrate'), at('/api/atlas/v2/groups:search')],
    noMatch: [at('/api/atlas/v2/groups/{groupId}')],
  },
});

export const isReset = defineCondition({
  id: 'path.isResetMethod',
  label: 'the path is a `:reset` custom method',
  subject: 'path',
  definition: 'The path is a custom method named `reset`, e.g. `/groups/{groupId}/settings:reset`.',
  fn: (ctx) => isResetMethod(ctx.resourcePath),
  examples: {
    match: [at('/api/atlas/v2/groups/{groupId}/settings:reset')],
    noMatch: [at('/api/atlas/v2/groups/{groupId}/settings'), at('/api/atlas/v2/groups/{groupId}/settings:restart')],
  },
});
