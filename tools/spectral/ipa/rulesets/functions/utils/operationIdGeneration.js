import { singularize } from "active-inflector";
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
    let verb = deriveActionVerb(method, resourceIdentifier);
    let nouns = resourceIdentifier
                    .split("/")
                    .filter(id => id.length > 0 && !isPathParam(id))
                    .map(noun => capitalize(noun));
    
    let opID = verb;
    for(let i = 0; i < nouns.length - 1; i++) {
        opID += singularize(nouns[i]);
    }
    
    // singularize final noun, dependent on resource identifier
    if (isSingleResourceIdentifier(resourceIdentifier) || verb == "create") {
        nouns[nouns.length - 1] = singularize(nouns[nouns.length - 1]);
    } 

    opID += nouns.pop();

    // if custom method name is multiple words, append trailing nouns to the operation ID
    if (!casing(method, { type: 'camel'})) {
        opID += method.slice(verb.length);
    }

    return opID;
}

/**
 * Derives action verb from custom method name. Returns standard method names as is.
 * 
 * @param method the custom method name
 */
function deriveActionVerb(method, path) {
    // legacy custom method - return last collection identifier from path
    if (method === "") {
        return path.split("/").pop();
    }

    // custom method name is camelCase return first word (assumed verb)
    if (!casing(method, { type: 'camel'})) {
        return method.match(/[A-Z]?[a-z]+/g)[0];
    }

    return method;
}

function capitalize(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}