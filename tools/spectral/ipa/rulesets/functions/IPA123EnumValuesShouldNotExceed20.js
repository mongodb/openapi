import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { getSchemaPathFromEnumPath } from './utils/schemaUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const ERROR_MESSAGE = 'The number of allowable enum values should not exceed 20 values. Current count: ';

export default (input, { maxEnumValues }, { path, documentInventory, rule }) => {
  const ruleName = rule.name;
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

  return evaluateAndCollectAdoptionStatus(errors, ruleName, schemaObject, path);
};
