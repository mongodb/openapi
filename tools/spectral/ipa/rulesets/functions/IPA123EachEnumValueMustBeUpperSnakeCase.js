import { resolveObject } from './utils/componentUtils.js';
import { casing } from '@stoplight/spectral-functions';
import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { getSchemaPathFromEnumPath } from './utils/schemaUtils.js';

const ERROR_MESSAGE = 'enum value must be UPPER_SNAKE_CASE.';

export default (input, _, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPathFromEnumPath(path);
  const schemaObject = resolveObject(oas, schemaPath);

  const errors = checkViolationsAndReturnErrors(input, schemaPath, ruleName);
  return evaluateAndCollectAdoptionStatus(errors, ruleName, schemaObject, path);
};

function checkViolationsAndReturnErrors(input, schemaPath, ruleName) {
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
    return handleInternalError(ruleName, schemaPath, e);
  }
}
