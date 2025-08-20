import { resolveObject } from './utils/componentUtils.js';
import { casing } from '@stoplight/spectral-functions';
import {
  evaluateAndCollectAdoptionStatus,
  handleInternalError,
} from './utils/collectionUtils.js';
import { getSchemaPathFromEnumPath } from './utils/schemaUtils.js';

const RULE_NAME = 'xgen-IPA-123-enum-values-must-be-upper-snake-case';
const ERROR_MESSAGE = 'enum value must be UPPER_SNAKE_CASE.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPathFromEnumPath(path);
  const schemaObject = resolveObject(oas, schemaPath);

  const errors = checkViolationsAndReturnErrors(input, schemaPath);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, schemaObject, path);
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
    return handleInternalError(RULE_NAME, schemaPath, e);
  }
}
