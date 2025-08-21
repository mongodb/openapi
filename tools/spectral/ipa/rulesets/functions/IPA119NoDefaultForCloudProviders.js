import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const ERROR_MESSAGE = 'When using a provider field or param, API producers should not define a default value.';
export default (input, { propertyNameToLookFor, cloudProviderEnumValues }, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const propertyObject = resolveObject(oas, path);
  const fieldType = path[path.length - 2];

  if (fieldType === 'parameters' && !propertyObject.schema) {
    return;
  }

  if (!inputIsCloudProviderField(fieldType, input, propertyObject, propertyNameToLookFor, cloudProviderEnumValues)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(propertyObject, path, fieldType, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, propertyObject, path);
};

function inputIsCloudProviderField(
  fieldType,
  propertyName,
  propertyObject,
  propertyNameToLookFor,
  cloudProviderEnumValues
) {
  let isCloudProviderField = false;
  if (fieldType === 'properties') {
    if (propertyName === propertyNameToLookFor) {
      isCloudProviderField = true;
    }

    if (Array.isArray(propertyObject.enum) && propertyObject.enum.length > 0) {
      isCloudProviderField = cloudProviderEnumValues.every((cloudProviderValue) =>
        propertyObject.enum.includes(cloudProviderValue)
      );
    }
  } else if (fieldType === 'parameters') {
    if (propertyObject.name === propertyNameToLookFor) {
      isCloudProviderField = true;
    }

    if (Array.isArray(propertyObject.schema.enum) && propertyObject.schema.enum.length > 0) {
      isCloudProviderField = cloudProviderEnumValues.every((cloudProviderValue) =>
        propertyObject.schema.enum.includes(cloudProviderValue)
      );
    }
  }
  return isCloudProviderField;
}

function checkViolationsAndReturnErrors(propertyObject, path, fieldType, ruleName) {
  try {
    const errors = [];

    if (fieldType === 'properties') {
      if (propertyObject.default !== undefined) {
        errors.push({
          path,
          message: ERROR_MESSAGE,
        });
        return errors;
      }
    } else if (fieldType === 'parameters') {
      if (propertyObject.schema.default !== undefined) {
        errors.push({
          path,
          message: ERROR_MESSAGE,
        });
        return errors;
      }
    }
    return errors;
  } catch (e) {
    return handleInternalError(ruleName, path, e);
  }
}
