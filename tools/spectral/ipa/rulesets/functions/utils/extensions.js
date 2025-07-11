export const VERB_OVERRIDE_EXTENSION = 'x-xgen-method-verb-override';

// for endpoint
export function hasMethodWithVerbOverride(endpoint) {
  const keys = Object.keys(endpoint);
  for (let i = 0; i < keys.length; i++) {
    if (endpoint[keys[i]][VERB_OVERRIDE_EXTENSION]) {
      return true;
    }
  }
  return false;
}

// for method
export function hasVerbOverride(object) {
  if (!object[VERB_OVERRIDE_EXTENSION]) {
    return false;
  }
  return true;
}

// for method
export function isLegacyCustomMethod(object) {
  if (hasVerbOverride(object)) {
    return object[VERB_OVERRIDE_EXTENSION].customMethod;
  }
  return false;
}

export function isGetOverride(object) {
  if (hasVerbOverride(object)) {
    return object[VERB_OVERRIDE_EXTENSION].verb === 'get';
  }
  return false;
}

export function isListOverride(object) {
  if (hasVerbOverride(object)) {
    return object[VERB_OVERRIDE_EXTENSION].verb === 'list';
  }
  return false;
}
