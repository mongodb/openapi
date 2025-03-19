import { collectAdoption, collectAndReturnViolation } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';

const RULE_NAME = 'xgen-IPA-125-oneOf-no-base-types';
const ERROR_MESSAGE = 'oneOf should not contain base types like integer, number, string, or boolean.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved; // Use unresolved document to access raw $ref
  const schema = resolveObject(oas, path);

  if (!schema || !schema.oneOf || !Array.isArray(schema.oneOf)) {
    return;
  }

  // Check for exception first
  if (hasException(schema, RULE_NAME)) {
    return;
  }

  // Check if any oneOf item is a base type
  const baseTypes = ['integer', 'number', 'string', 'boolean'];
  const hasBaseType = schema.oneOf.some(
    (item) => typeof item === 'object' && item.type && baseTypes.includes(item.type)
  );

  if (hasBaseType) {
    return collectAndReturnViolation(path, RULE_NAME, [{ message: ERROR_MESSAGE }]);
  }

  collectAdoption(path, RULE_NAME);
};
