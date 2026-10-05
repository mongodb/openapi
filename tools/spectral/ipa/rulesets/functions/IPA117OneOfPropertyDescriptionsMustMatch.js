import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

/**
 * Polymorphic property-description divergence check for IPA-117.
 *
 * For every property name shared across two or more `oneOf` variants, the property's `description`
 * must be byte-equal across variants.
 *
 * @param {object[]} input the `oneOf` array (from `given: '$..oneOf'`)
 * @param _ unused options
 * @param {object} context the context object containing the path, documentInventory and rule
 */
export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const schemaPath = path.slice(0, path.length - 1);
  const parentSchema = resolveObject(oas, schemaPath);

  if (!Array.isArray(input) || input.length < 2) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, schemaPath, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, parentSchema, schemaPath);
};

function checkViolationsAndReturnErrors(variants, path, ruleName) {
  try {
    // Build a property name -> set of descriptions map across all variants
    const descriptionsByProperty = new Map();
    variants.forEach((variant) => {
      const properties = variant?.properties;
      if (!properties) {
        return;
      }
      Object.keys(properties).forEach((propertyName) => {
        if (!descriptionsByProperty.has(propertyName)) {
          descriptionsByProperty.set(propertyName, []);
        }
        descriptionsByProperty.get(propertyName).push(properties[propertyName].description);
      });
    });

    const errors = [];
    descriptionsByProperty.forEach((descriptions, propertyName) => {
      // Only shared properties (present in two or more variants) are checked
      if (descriptions.length > 1 && !descriptions.every((description) => description === descriptions[0])) {
        errors.push({
          path,
          message: `Property '${propertyName}' has diverging descriptions across oneOf variants. Shared properties must use the same description.`,
        });
      }
    });
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
