import { hasException } from './utils/exceptions.js';
import { resolveObject } from './utils/componentUtils.js';
import { casing } from '@stoplight/spectral-functions';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-123-enum-values-must-be-upper-snake-case';
const ERROR_MESSAGE = 'enum value must be UPPER_SNAKE_CASE.';

function getSchemaPathFromEnumPath(path) {
  const enumIndex = path.lastIndexOf('enum');
  if (path[enumIndex - 1] === 'items') {
    return path.slice(0, enumIndex - 1);
  }
  return path.slice(0, enumIndex);
}

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPathFromEnumPath(path);
  const schemaObject = resolveObject(oas, schemaPath);
  if (hasException(schemaObject, RULE_NAME)) {
    collectException(schemaObject, RULE_NAME, schemaPath);
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

  if (errors.length === 0) {
    collectAdoption(schemaPath, RULE_NAME);
  } else {
    return collectAndReturnViolation(schemaPath, RULE_NAME, errors);
  }
};
