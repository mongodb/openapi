import { singularize } from 'ember-inflector';
import { isPathParam, removePrefix, isSingleResourceIdentifier } from './resourceEvaluation.js';
import { casing } from '@stoplight/spectral-functions';

/**
 * Returns IPA Compliant Operation ID.
 *
 * @param method the standard method name (create, update, get etc.), custom method name, or empty string (only for legacy custom methods)
 * @param path the path for the endpoint
 */
export function generateOperationID(method, path) {
  let resourceIdentifier = removePrefix(path);
  let nouns = resourceIdentifier
    .split('/')
    .filter((section) => section.length > 0 && !isPathParam(section))
    .map((noun) => capitalize(noun));

  // legacy custom method - use end of path as custom method name
  if (!method) {
    method = path.split('/').pop();
    nouns.pop();
  }

  let verb = deriveActionVerb(method);

  // if custom method name is multiple words, add trailing nouns to the operation ID
  if (!casing(method, { type: 'camel' }) && method.length > verb.length) {
    nouns.push(method.slice(verb.length));
  }

  let opID = verb;
  for (let i = 0; i < nouns.length - 1; i++) {
    opID += singularize(nouns[i]);
  }

  // singularize final noun, dependent on resource identifier
  if (isSingleResourceIdentifier(resourceIdentifier) || verb === 'create') {
    nouns[nouns.length - 1] = singularize(nouns[nouns.length - 1]);
  }

  opID += nouns.pop();

  return opID;
}

/**
 * Derives action verb from custom method name. Returns standard method names as is.
 *
 * @param method the custom method name
 */
function deriveActionVerb(method) {
  // custom method name is camelCase return first word (assumed verb)
  if (!casing(method, { type: 'camel' })) {
    return method.match(/[A-Z]?[a-z]+/g)[0];
  }

  return method;
}

function capitalize(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
