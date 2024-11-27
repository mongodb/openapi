const EXEMPTION_EXTENSION = 'x-xgen-IPA-exception';

/**
 * Checks if the object has an exemption set for the passed rule name by checking
 * if the object has a field "x-xgen-IPA-exception" containing the rule as a
 * field.
 *
 * @param ruleName the name of the exemption
 * @param object the object to evaluate
 * @returns {boolean}
 */
export function hasExemption(ruleName, object) {
  const exemptions = object[EXEMPTION_EXTENSION];
  return exemptions !== undefined && Object.keys(exemptions).includes(ruleName);
}
