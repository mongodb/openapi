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

  if (hasException(propertyObject, RULE_NAME)) {
    collectException(propertyObject, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(
    input,
    propertyObject,
    path,
    propertyNameToLookFor,
    fieldType,
    cloudProviderEnumValues
  );
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
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
    if (fieldType === 'properties') {
      if (propertyName === propertyNameToLookFor && propertyObject.default !== undefined) {
        return [
          {
            path,
            message: ERROR_MESSAGE,
          },
        ];
      }

      if (Array.isArray(propertyObject.enum) && propertyObject.enum.length > 0) {
        const enumValues = propertyObject.enum;
        const hasCloudProviderEnumValue = cloudProviderEnumValues.every((cloudProviderValue) =>
          enumValues.includes(cloudProviderValue)
        );
        if (hasCloudProviderEnumValue && propertyObject.default !== undefined) {
          return [
            {
              path,
              message: ERROR_MESSAGE,
            },
          ];
        }
      }
    } else if (fieldType === 'parameters') {
      if (propertyObject.name === propertyNameToLookFor && propertyObject.schema.default !== undefined) {
        return [
          {
            path,
            message: ERROR_MESSAGE,
          },
        ];
      }

      if (Array.isArray(propertyObject.schema.enum) && propertyObject.schema.enum.length > 0) {
        const enumValues = propertyObject.schema.enum;
        const hasCloudProviderEnumValue = cloudProviderEnumValues.every((cloudProviderValue) =>
          enumValues.includes(cloudProviderValue)
        );

        if (hasCloudProviderEnumValue && propertyObject.schema.default !== undefined) {
          return [
            {
              path,
              message: ERROR_MESSAGE,
            },
          ];
        }
      }
    }

    return [];
  } catch (e) {
    handleInternalError(RULE_NAME, path, e);
  }
}
