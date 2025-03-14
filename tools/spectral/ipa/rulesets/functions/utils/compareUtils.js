// utils/compareUtils.js

/**
 * Deep equality check between two values
 * Does not handle circular references
 * @param {*} value1 First value to compare
 * @param {*} value2 Second value to compare
 * @returns {boolean} Whether the values are deeply equal
 */
export function isDeepEqual(value1, value2) {
  // If the values are strictly equal (including handling null/undefined)
  if (value1 === value2) return true;

  // If either value is null or not an object, they're not equal (we already checked strict equality)
  if (value1 == null || value2 == null || typeof value1 !== 'object' || typeof value2 !== 'object') {
    return false;
  }

  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);

  // Different number of properties
  if (keys1.length !== keys2.length) return false;

  // Check that all properties in value1 exist in value2 and are equal
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;

    // Recursive equality check for nested objects
    if (!isDeepEqual(value1[key], value2[key])) return false;
  }

  return true;
}

/**
 * Recursively removes properties with given flags from schema
 * @param {object} schema The schema to process
 * @param {string} propertyToRemove The property type to remove (boolean property)
 * @returns {object} New schema with specified properties removed
 */
export function removePropertyByFlag(schema, propertyToRemove) {
  if (!schema || typeof schema !== 'object') return schema;

  if (Array.isArray(schema)) {
    return schema.map((item) => removePropertyByFlag(item, propertyToRemove));
  }

  const result = {};

  // Handle regular object properties
  for (const [key, value] of Object.entries(schema)) {
    // Skip this property if it's marked with the flag we're removing
    if (key === propertyToRemove && value === true) continue;

    // Handle properties object specially
    if (key === 'properties' && typeof value === 'object') {
      result[key] = {};
      for (const [propName, propValue] of Object.entries(value)) {
        // Skip properties marked with the flag we're removing
        if (propValue[propertyToRemove] === true) continue;
        result[key][propName] = removePropertyByFlag(propValue, propertyToRemove);
      }
    } else if (typeof value === 'object') {
      result[key] = removePropertyByFlag(value, propertyToRemove);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Recursively removes properties with readOnly: true flag from schema
 * @param {object} schema The schema to process
 * @returns {object} New schema with readOnly properties removed
 */
export function removeReadOnlyProperties(schema) {
  return removePropertyByFlag(schema, 'readOnly');
}

/**
 * Recursively removes properties with writeOnly: true flag from schema
 * @param {object} schema The schema to process
 * @returns {object} New schema with writeOnly properties removed
 */
export function removeWriteOnlyProperties(schema) {
  return removePropertyByFlag(schema, 'writeOnly');
}
