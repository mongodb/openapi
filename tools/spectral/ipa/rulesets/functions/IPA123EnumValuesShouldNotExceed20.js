import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { getSchemaPathFromEnumPath } from './utils/schemaUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-123-enum-values-should-not-exceed-20';
const ERROR_MESSAGE = 'Enum arrays should not exceed 20 values. Current count: ';
const MAX_ENUM_VALUES = 20;

export default (input, options, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPathFromEnumPath(path);
  const schemaObject = resolveObject(oas, schemaPath);

  // Check for exceptions
  if (hasException(schemaObject, RULE_NAME)) {
    collectException(schemaObject, RULE_NAME, path);
    return;
  }

  if (!Array.isArray(input)) {
    return;
  }

  if (input.length > MAX_ENUM_VALUES) {
    return collectAndReturnViolation(path, RULE_NAME, [
      {
        path,
        message: `${ERROR_MESSAGE}${input.length}`,
      },
    ]);
  }

  collectAdoption(path, RULE_NAME);
};
