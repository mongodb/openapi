const inflection = require('inflection');
import { isPathParam, removePrefix, isSingleResourceIdentifier } from './resourceEvaluation.js';

const CAMEL_CASE = /[A-Z]?[a-z]+/g;
export const CAMEL_CASE_WITH_ABBREVIATIONS = /[A-Z]+(?![a-z0-9])|[A-Z]*[a-z0-9]+/g;
const OPERATIONS_SECTION = 'operations';

/**
 * Returns IPA Compliant Operation ID.
 *
 * @param method the standard method name (create, update, get etc.), custom method name, or empty string (only for legacy custom methods)
 * @param path the path for the endpoint
 * @param ignoreSingularizationList a list of nouns to ignore when singularizing resource names
 */
export function generateOperationID(method, path, ignoreSingularizationList = []) {
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

  // a collection-scoped Operations resource keeps its parent's plural form, so that its operation ID
  // does not collide with the instance-scoped Operations resource of the same parent
  const keepParentPlural = isCollectionScopedOperationsPath(resourceIdentifier) && !camelCaseCustomMethod;

  let opID = verb;
  for (let i = 0; i < nouns.length - 1; i++) {
    const isParentOfOperations = i === nouns.length - 2;
    opID += upperCamelCase(
      keepParentPlural && isParentOfOperations ? nouns[i] : singularize(nouns[i], ignoreSingularizationList)
    );
  }

  // singularize final noun, dependent on resource identifier - leave custom nouns alone
  if (
    ((isPathParam(resourceIdentifier.split('/').pop()) || isSingleResourceIdentifier(resourceIdentifier)) &&
      !camelCaseCustomMethod) ||
    verb === 'create'
  ) {
    nouns[nouns.length - 1] = singularize(nouns[nouns.length - 1], ignoreSingularizationList);
  }

  opID += upperCamelCase(nouns.pop());

  return opID;
}

/**
 * Counts the number of words in a camelCase string. Allows for abbreviations (e.g. 'getOpenAPI') and numbers (e.g. 'X509').
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

/**
 * Checks if a resource identifier is a collection-scoped Operations resource, i.e. the trailing
 * 'operations' section is attached to a parent resource collection rather than to a single resource.
 * '/groups/{groupId}/clusters/operations' returns true
 * '/groups/{groupId}/clusters/{clusterName}/operations' returns false
 * '/operations' returns false
 *
 * @param {string} resourceIdentifier the resource identifier to evaluate, without prefix
 * @returns {boolean}
 */
function isCollectionScopedOperationsPath(resourceIdentifier) {
  const sections = resourceIdentifier.split('/').filter((section) => section.length > 0);
  if (sections.length < 2 || sections[sections.length - 1] !== OPERATIONS_SECTION) {
    return false;
  }
  return !isPathParam(sections[sections.length - 2]);
}

function capitalize(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function singularize(noun, ignoreSingularizationList = []) {
  if (!ignoreSingularizationList.includes(noun)) {
    return inflection.singularize(noun);
  }
  return noun;
}

function upperCamelCase(input) {
  if (input) {
    return input
      .match(CAMEL_CASE_WITH_ABBREVIATIONS)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
  return input;
}
