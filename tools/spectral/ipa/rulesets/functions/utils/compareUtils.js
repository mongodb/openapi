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
 * Deep clone an object while omitting specific properties
 * @param {object} obj Object to clone and omit properties from
 * @param {...string} keys Properties to omit
 * @returns {object} New object without the specified properties
 */
export function omitDeep(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => omitDeep(item, ...keys));
  }

  // Handle regular objects
  return Object.entries(obj).reduce((result, [key, value]) => {
    // Skip properties that should be omitted
    if (keys.includes(key)) return result;

    // Handle nested objects/arrays recursively
    if (value && typeof value === 'object') {
      result[key] = omitDeep(value, ...keys);
    } else {
      result[key] = value;
    }

    return result;
  }, {});
}
