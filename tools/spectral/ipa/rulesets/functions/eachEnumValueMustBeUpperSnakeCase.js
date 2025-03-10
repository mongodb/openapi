import { hasException } from './utils/exceptions.js';
import { resolveObject } from './utils/componentUtils.js';
import { casing } from '@stoplight/spectral-functions';
import {
  collectAdoption,
  collectAndReturnViolation,
  collectException,
  handleInternalError,
} from './utils/collectionUtils.js';
import { getSchemaPathFromEnumPath } from './utils/schemaUtils.js';

const RULE_NAME = 'xgen-IPA-123-enum-values-must-be-upper-snake-case';
const ERROR_MESSAGE = 'enum value must be UPPER_SNAKE_CASE.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPathFromEnumPath(path);
  const schemaObject = resolveObject(oas, schemaPath);

  if (hasException(schemaObject, RULE_NAME)) {
    collectException(schemaObject, RULE_NAME, schemaPath);
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, schemaPath);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(schemaPath, RULE_NAME);
};

function checkViolationsAndReturnErrors(input, schemaPath) {
  const errors = [];
  try {
    input.forEach((enumValue, index) => {
      const isUpperSnakeCase = casing(enumValue, { type: 'macro' });

      if (isUpperSnakeCase) {
        errors.push({
          path: schemaPath,
          message: `enum[${index}]:${enumValue} ${ERROR_MESSAGE} `,
        });
      }
    });
    return errors;
  } catch (e) {
    handleInternalError(RULE_NAME, schemaPath, e);
  }
}
