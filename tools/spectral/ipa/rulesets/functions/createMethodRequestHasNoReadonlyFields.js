import { isCustomMethodIdentifier } from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';
import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { findPropertiesByAttribute } from './utils/schemaUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-has-no-readonly-fields';
const ERROR_MESSAGE = 'The Create method request object must not include input fields (readOnly properties).';

export default (input, _, { path, documentInventory }) => {
  const resourcePath = path[1];
  const oas = documentInventory.resolved;
  let mediaType = input;

  if (isCustomMethodIdentifier(resourcePath) || !mediaType.endsWith('json')) {
    return;
  }

  const requestContentPerMediaType = resolveObject(oas, path);
  if (!requestContentPerMediaType || !requestContentPerMediaType.schema) {
    return;
  }

  if (hasException(requestContentPerMediaType, RULE_NAME)) {
    collectException(requestContentPerMediaType, RULE_NAME, path);
    return;
  }

  const errors = checkViolationsAndReturnErrors(requestContentPerMediaType, path);

  if (errors.length !== 0) {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }

  collectAdoption(path, RULE_NAME);
};

function checkViolationsAndReturnErrors(contentPerMediaType, path) {
  return findPropertiesByAttribute(contentPerMediaType.schema, 'readOnly', path, [], ERROR_MESSAGE);
}
