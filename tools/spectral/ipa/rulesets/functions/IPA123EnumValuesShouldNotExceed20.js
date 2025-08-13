import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { getSchemaPathFromEnumPath } from './utils/schemaUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-123-allowable-enum-values-should-not-exceed-20';
const ERROR_MESSAGE = 'The number of allowable enum values should not exceed 20 values. Current count: ';

export default (input, { maxEnumValues }, { path, documentInventory }) => {
  const oas = documentInventory.resolved;
  const schemaPath = getSchemaPathFromEnumPath(path);
  const schemaObject = resolveObject(oas, schemaPath);

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
