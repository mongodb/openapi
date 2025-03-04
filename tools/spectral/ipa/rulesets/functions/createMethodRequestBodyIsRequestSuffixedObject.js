import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { isCustomMethod } from './utils/resourceEvaluation.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-106-create-method-request-body-is-request-suffixed-object';
const ERROR_MESSAGE = 'Response body for the Create method should refer to Request suffixed schema.';

export default (input, _, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const resourcePath = path[1];
  if (isCustomMethod(resourcePath)) {
    return;
  }

  const content = resolveObject(oas, path);
  if (hasException(content, RULE_NAME)) {
    collectException(content, RULE_NAME, path);
    return;
  }

  const errors = [];
  for (const mediaType in content) {
    const media = content[mediaType];
    if (media.schema) {
      const schema = media.schema;
      if (schema.$ref && !schema.$ref.endsWith('Request')) {
        errors.push({
          path: path.concat(mediaType),
          message: `${ERROR_MESSAGE}`,
        });
      }
    }
  }

  if (errors.length === 0) {
    collectAdoption(path, RULE_NAME);
  } else {
    return collectAndReturnViolation(path, RULE_NAME, errors);
  }
};
