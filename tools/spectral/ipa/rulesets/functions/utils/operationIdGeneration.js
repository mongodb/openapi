const inflection = require('inflection');
import { isPathParam, removePrefix, isSingleResourceIdentifier } from './resourceEvaluation.js';

const CAMEL_CASE = /[A-Z]?[a-z]+/g;
const CAMEL_CASE_WITH_ABBREVIATIONS = /[A-Z]+(?![a-z])|[A-Z]*[a-z]+/g;

/**
 * Returns IPA Compliant Operation ID.
 *
 * @param method the standard method name (create, update, get etc.), custom method name, or empty string (only for legacy custom methods)
 * @param path the path for the endpoint
 */
export function generateOperationID(method, path, ignoreList = []) {
  if (!path) {
    return method;
  }

  let resourceIdentifier = removePrefix(path);
  if (resourceIdentifier.includes('.')) {
    resourceIdentifier = resourceIdentifier.substring(0, resourceIdentifier.lastIndexOf('.'));
  }

  let nouns = resourceIdentifier.split('/').filter((section) => section.length > 0 && !isPathParam(section));

  // legacy custom method - use end of path as custom method name
  if (!method) {
    method = nouns.pop();
    resourceIdentifier = resourceIdentifier.slice(0, resourceIdentifier.lastIndexOf('/'));
  }

  nouns = nouns.map((noun) => capitalize(noun));

  let verb = deriveActionVerb(method);
  const camelCaseCustomMethod = method.length > verb.length;

  // if custom method name is multiple words, add trailing nouns to the operation ID
  if (camelCaseCustomMethod) {
    nouns.push(method.slice(verb.length));
  }

  let opID = verb;
  for (let i = 0; i < nouns.length - 1; i++) {
    opID += singularize(nouns[i], ignoreList);
  }

  // singularize final noun, dependent on resource identifier - leave custom nouns alone
  if (
    ((isPathParam(resourceIdentifier.split('/').pop()) || isSingleResourceIdentifier(resourceIdentifier)) &&
      !camelCaseCustomMethod) ||
    verb === 'create'
  ) {
    nouns[nouns.length - 1] = singularize(nouns[nouns.length - 1], ignoreList);
  }

  opID += nouns.pop();

  return opID;
}

/**
 * Counts the number of words in a camelCase string. Allows for abbreviations (e.g. 'getOpenAPI').
 * @param operationId
 * @returns {number}
 */
export function numberOfWords(operationId) {
  return operationId.match(CAMEL_CASE_WITH_ABBREVIATIONS)?.length || 0;
}

/**
 * Shortens an operation ID to the first word (verb) and last 3 words.
 * @param operationId
 * @returns {string}
 */
export function shortenOperationId(operationId) {
  const words = operationId.match(CAMEL_CASE_WITH_ABBREVIATIONS);
  if (!words || words.length < 4) {
    return operationId; // Return as is if there are not enough words to shorten
  }
  return words[0] + words.slice(words.length - 3).join('');
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

function singularize(noun, ignoreList = []) {
  if (!ignoreList.includes(noun)) {
    return inflection.singularize(noun);
  }
  return noun;
}
