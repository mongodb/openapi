import { casing } from '@stoplight/spectral-functions';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

// Units of measure abbreviations that are legitimately uppercase in camelCase field names.
// e.g. diskGB, memoryMB, storageKB, cpuGHz.
// The pattern matches a UoM suffix that is preceded by a lowercase letter or digit
// (i.e. it follows a camelCase word) and is either at the end of the name or followed
// by an uppercase letter (start of the next camelCase word).
const UOM_ABBREVIATIONS = ['GB', 'MB', 'KB', 'TB', 'PB', 'GHz', 'MHz', 'KHz', 'Mbps', 'Kbps', 'Gbps', 'Tbps'];
const UOM_PATTERN = new RegExp(
  '(?<=[a-z0-9])(' + UOM_ABBREVIATIONS.join('|') + ')(?=[A-Z]|$)',
  'g',
);

/**
 * Normalise known UoM abbreviations so the camelCase check does not reject them.
 * e.g. "diskGB" → "diskGb", "maxSizeGB" → "maxSizeGb".
 * The original field name is preserved in the error message.
 */
function normaliseUoM(name) {
  return name.replace(UOM_PATTERN, (m) => m[0] + m.slice(1).toLowerCase());
}

export default (input, options, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref):
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(input, path, ruleName) {
  try {
    if (casing(normaliseUoM(input), { type: 'camel', disallowDigits: true })) {
      const errorMessage = `Property "${input}" must use camelCase format.`;
      return [{ path, message: errorMessage }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
