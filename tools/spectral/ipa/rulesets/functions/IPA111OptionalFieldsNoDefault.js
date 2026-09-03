import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { pathIsForRequestVersion, resolveObject } from './utils/componentUtils.js';
import { isRequiredProperty } from './utils/schemaUtils.js';
import { hasServerComputedWhenClientOmittedExtension } from './utils/extensions.js';

const ERROR_MESSAGE =
  'Optional fields must not define a default value. Remove the default or mark the field with x-xgen-server-computed-when-client-omitted if the server computes it when omitted.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.unresolved;
  const property = resolveObject(oas, path);

  // Skip schema references ($ref):
  // Referenced schemas are validated separately to prevent duplicate violations
  if (!property) {
    return;
  }

  // Boolean fields are handled by xgen-IPA-111-optional-boolean-fields-default-false
  if (property.type === 'boolean') {
    return;
  }

  // The rule only applies to optional fields
  if (isRequiredProperty(oas, path)) {
    return;
  }

  // Fields computed by the server when the client omits them are allowed to define a default
  if (hasServerComputedWhenClientOmittedExtension(property)) {
    return;
  }

  // Scoped to request schemas only
  if (!pathIsForRequestVersion(path)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(property, path, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, property, path);
};

function checkViolationsAndReturnErrors(property, path, ruleName) {
  try {
    if (property.default !== undefined) {
      return [{ path, message: ERROR_MESSAGE }];
    }
    return [];
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
