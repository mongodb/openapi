import { hasException } from './utils/exceptions.js';
import { resolveObject } from './utils/componentUtils.js';
import { casing } from '@stoplight/spectral-functions';

const RULE_NAME = 'xgen-IPA-123-enum-values-must-be-upper-snake-case';
const ERROR_MESSAGE = 'enum value must be UPPER_SNAKE_CASE.';

export function getSchemaPathFromEnumPath(path) {
  if(path.includes('items')) {
    path = path.slice(0, - 1);
  }
  return path.slice(0, - 1);
}

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPathFromEnumPath(path);
  const schemaObject = resolveObject(oas, schemaPath);
  if (hasException(schemaObject, RULE_NAME)) {
    return;
  }

  const errors = [];
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
};
