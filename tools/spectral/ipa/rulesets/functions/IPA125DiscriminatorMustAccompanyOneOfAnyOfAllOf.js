import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const ERROR_MESSAGE = "Each discriminator property must be accompanied by a 'oneOf', 'anyOf' or 'allOf' property.";

export default (input, _, { path, documentInventory, rule }) => {
  const errors = checkViolationsAndReturnErrors(input, path, documentInventory.resolved);
  return evaluateAndCollectAdoptionStatus(errors, rule.name, input, path);
};

function checkViolationsAndReturnErrors(input, path, oas) {
  const siblings = Object.keys(resolveObject(oas, path.slice(0, path.length - 1)));

  if (!siblings.includes('oneOf') && !siblings.includes('anyOf') && !siblings.includes('allOf')) {
    return [
      {
        path,
        message: ERROR_MESSAGE,
      },
    ];
  }
  return [];
}
