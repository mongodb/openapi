import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const ERROR_MESSAGE = "Each discriminator property must be accompanied by a 'oneOf', 'anyOf' or 'allOf' property.";

export default (input, _, { path, documentInventory, rule }) => {
  const siblings = resolveObject(documentInventory.resolved, path.slice(0, path.length - 1));

  const errors = checkViolationsAndReturnErrors(input, path, Object.keys(siblings));
  return evaluateAndCollectAdoptionStatus(errors, rule.name, siblings, path);
};

function checkViolationsAndReturnErrors(input, path, siblingKeys) {
  if (!siblingKeys.includes('oneOf') && !siblingKeys.includes('anyOf') && !siblingKeys.includes('allOf')) {
    return [
      {
        path,
        message: ERROR_MESSAGE,
      },
    ];
  }
  return [];
}
