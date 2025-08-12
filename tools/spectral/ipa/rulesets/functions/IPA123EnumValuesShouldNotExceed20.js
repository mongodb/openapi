import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
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

  if (!Array.isArray(input)) {
    return;
  }

  let errors = [];
  if (input.length > maxEnumValues) {
    errors = [
      {
        path,
        message: `${ERROR_MESSAGE}${input.length}`,
      },
    ];
  }

  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, schemaObject, path);
};
