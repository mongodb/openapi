import { hasException } from './utils/exceptions.js';
import { getSchemaPath, resolveObject } from './utils/componentUtils.js';
import { casing } from '@stoplight/spectral-functions';

const RULE_NAME = 'xgen-IPA-123-enum-values-must-be-upper-snake-case';
const ERROR_MESSAGE = 'enum value must be UPPER_SNAKE_CASE.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPath(path);
  const schemaObject = resolveObject(oas, schemaPath);
  if (hasException(schemaObject, RULE_NAME)) {
    return;
  }

  const errors = [];
  for (const enumValue of input) {
    const isUpperSnakeCase = casing(enumValue, { type: 'macro' });

    if (isUpperSnakeCase) {
      errors.push({
        message: `${enumValue} ${ERROR_MESSAGE} `,
        path: path.concat(enumValue),
      });
    }
  }

  return errors;
};
