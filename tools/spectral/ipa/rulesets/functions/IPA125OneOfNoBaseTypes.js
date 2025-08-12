import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-125-oneOf-no-base-types';
const ERROR_MESSAGE_MIXED = 'oneOf should not mix base types with references.';
const ERROR_MESSAGE_MULTIPLE = 'oneOf should not contain multiple different base types.';

export default (input, _, { path, documentInventory }) => {
  if (!input.oneOf || !Array.isArray(input.oneOf)) {
    return;
  }
  const schema = resolveObject(documentInventory.unresolved, path);

  const errors = checkViolationsAndReturnErrors(schema, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, schema, path);
};

function checkViolationsAndReturnErrors(schema, path) {
  const baseTypes = ['string', 'number', 'integer', 'boolean'];
  const foundBaseTypes = new Set();
  let hasRef = false;
  let hasBaseType = false;

  // Check each oneOf item
  for (const item of schema.oneOf) {
    if (item.$ref) {
      hasRef = true;
      continue;
    }

    if (item.type && baseTypes.includes(item.type)) {
      hasBaseType = true;
      foundBaseTypes.add(item.type);
    }
  }

  if (hasRef && hasBaseType) {
    return [{ path, message: ERROR_MESSAGE_MIXED }];
  }

  if (foundBaseTypes.size > 1) {
    return [{ path, message: ERROR_MESSAGE_MULTIPLE }];
  }

  return [];
}
