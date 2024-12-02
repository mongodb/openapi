import exemptionCollector from 'tools/ipa/ExemptionCollector';

const EXEMPTION_EXTENSION = 'x-xgen-IPA-exception';

/**
 * Checks if the object has an exemption set for the passed rule name by checking
 * if the object has a field "x-xgen-IPA-exception" containing the rule as a
 * field.
 *
 * @param ruleName the name of the exemption
 * @param object the object to evaluate
 * @param context the context of the rule function
 * @returns {boolean}
 */
export function hasException(ruleName, object, context) {
  const exemptions = object[EXEMPTION_EXTENSION];
  const hasException = exemptions !== undefined && Object.keys(exemptions).includes(ruleName);
  if (hasException) {
    exemptionCollector.log(ruleName, context, exemptions[ruleName]);
    console.log('Exception\t', ruleName, '\t', context.path.join('.'));
  }
  return hasException;
}

