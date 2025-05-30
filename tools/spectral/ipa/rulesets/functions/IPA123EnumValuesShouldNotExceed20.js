import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { getSchemaPathFromEnumPath } from './utils/schemaUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-123-allowable-enum-values-should-not-exceed-20';
const ERROR_MESSAGE = 'Inline enum arrays should not exceed 20 values. Current count: ';

export default (input, { maxEnumValues }, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPathFromEnumPath(path);
  const schemaObject = resolveObject(oas, schemaPath);

  //Ignore if the schemaObject belongs to a reusable enum
  if (!schemaPath.includes('properties') && !schemaPath.includes('parameters')) {
    return;
  }

  // Check for exceptions
  if (hasException(schemaObject, RULE_NAME)) {
    collectException(schemaObject, RULE_NAME, path);
    return;
  }

  if (!Array.isArray(input)) {
    return;
  }

  if (input.length > maxEnumValues) {
    return collectAndReturnViolation(path, RULE_NAME, [
      {
        path,
        message: `${ERROR_MESSAGE}${input.length}`,
      },
    ]);
  }

  collectAdoption(path, RULE_NAME);
};
