import { hasException } from './utils/exceptions.js';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-119-no-default-for-cloud-providers';
const ERROR_MESSAGE = 'When using a provider field or param, API producers should not define a default value.';
export default (input, { propertyNameToLookFor, cloudProviderEnumValues }, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const propertyObject = resolveObject(oas, path);
  const fieldType = path[path.length - 2];

  if (fieldType === 'parameters' && !propertyObject.schema) {
    return;
  }

  if (hasException(propertyObject, RULE_NAME)) {
    collectException(propertyObject, RULE_NAME, path);
    return;
  }

  const result = checkViolationsAndReturnErrors(
    input,
    propertyObject,
    path,
    propertyNameToLookFor,
    fieldType,
    cloudProviderEnumValues
  );
  if (result.errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, result.errors);
  }
  if (result.isCloudProviderField) {
    collectAdoption(path, RULE_NAME);
  }
};

function checkViolationsAndReturnErrors(
  propertyName,
  propertyObject,
  path,
  propertyNameToLookFor,
  fieldType,
  cloudProviderEnumValues
) {
  try {
    const result = {
      errors: [],
      isCloudProviderField: false,
    };

    if (fieldType === 'properties') {
      if (propertyName === propertyNameToLookFor) {
        result.isCloudProviderField = true;
        if (propertyObject.default !== undefined) {
          result.errors.push({
            path,
            message: ERROR_MESSAGE,
          });
          return result;
        }
      }

      if (Array.isArray(propertyObject.enum) && propertyObject.enum.length > 0) {
        const enumValues = propertyObject.enum;
        const hasCloudProviderEnumValue = cloudProviderEnumValues.every((cloudProviderValue) =>
          enumValues.includes(cloudProviderValue)
        );
        if (hasCloudProviderEnumValue) {
          result.isCloudProviderField = true;
          if (propertyObject.default !== undefined) {
            result.errors.push({
              path,
              message: ERROR_MESSAGE,
            });
            return result;
          }
        }
      }
    } else if (fieldType === 'parameters') {
      if (propertyObject.name === propertyNameToLookFor) {
        result.isCloudProviderField = true;
        if (propertyObject.schema.default !== undefined) {
          result.errors.push({
            path,
            message: ERROR_MESSAGE,
          });
          return result;
        }
      }

      if (Array.isArray(propertyObject.schema.enum) && propertyObject.schema.enum.length > 0) {
        const enumValues = propertyObject.schema.enum;
        const hasCloudProviderEnumValue = cloudProviderEnumValues.every((cloudProviderValue) =>
          enumValues.includes(cloudProviderValue)
        );

        if (hasCloudProviderEnumValue) {
          result.isCloudProviderField = true;
          if (propertyObject.schema.default !== undefined) {
            result.errors.push({
              path,
              message: ERROR_MESSAGE,
            });
            return result;
          }
        }
      }
    }

    return result;
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
