import { collectAdoption, collectAndReturnViolation } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-125-oneOf-no-base-types';
const ERROR_MESSAGE = 'oneOf should not contain base types like integer, number, string, or boolean.';

export default (input, _, { path, documentInventory }) => {
  if (!input.oneOf || !Array.isArray(input.oneOf)) {
    return;
  }
  const schema = resolveObject(documentInventory.unresolved, path);
  if (hasException(schema, RULE_NAME)) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(schema, path);
  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(schema, path) {
  // Check if any oneOf item is a base type
  const baseTypes = ['integer', 'number', 'string', 'boolean'];
  const hasBaseType = schema.oneOf.some(
    (item) => typeof item === 'object' && item.type && baseTypes.includes(item.type)
  );

  if (hasBaseType) {
    return [{ path, message: ERROR_MESSAGE }];
  }

  return [];
}
