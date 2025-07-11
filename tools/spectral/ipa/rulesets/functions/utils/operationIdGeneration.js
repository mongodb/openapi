const inflection = require('inflection');
import { isPathParam, removePrefix, isSingleResourceIdentifier } from './resourceEvaluation.js';

const CAMEL_CASE = /[A-Z]?[a-z]+/g;

/**
 * Returns IPA Compliant Operation ID.
 *
 * @param method the standard method name (create, update, get etc.), custom method name, or empty string (only for legacy custom methods)
 * @param path the path for the endpoint
 */
export function generateOperationID(method, path) {
  let resourceIdentifier = removePrefix(path);
  if (resourceIdentifier.includes('.')) {
    resourceIdentifier = resourceIdentifier.substring(0, resourceIdentifier.lastIndexOf('.'));
  }

  let nouns = resourceIdentifier.split('/').filter((section) => section.length > 0 && !isPathParam(section));

  // legacy custom method - use end of path as custom method name
  if (!method) {
    method = nouns.pop();
  }

  nouns = nouns.map((noun) => capitalize(noun));

  let verb = deriveActionVerb(method);

  // if custom method name is multiple words, add trailing nouns to the operation ID
  if (method.length > verb.length) {
    nouns.push(method.slice(verb.length));
  }

  let opID = verb;
  for (let i = 0; i < nouns.length - 1; i++) {
    opID += inflection.singularize(nouns[i]);
  }

  // singularize final noun, dependent on resource identifier
  if (isSingleResourceIdentifier(resourceIdentifier) || verb === 'create') {
    nouns[nouns.length - 1] = inflection.singularize(nouns[nouns.length - 1]);
  }

  opID += nouns.pop();

  return opID;
}

/**
 * Derives action verb from custom method name. Returns standard method names as is.
 * Assumes the first word of camelCase method names is the action verb.
 *
 * @param method the custom method name
 */
function deriveActionVerb(method) {
  return method.match(CAMEL_CASE)[0];
}

function capitalize(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
