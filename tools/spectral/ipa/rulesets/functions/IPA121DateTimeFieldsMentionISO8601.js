import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';
import { resolveObject } from './utils/componentUtils.js';

const RULE_NAME = 'xgen-IPA-121-date-time-fields-mention-iso-8601';
const ERROR_MESSAGE =
  'API producers must use ISO 8601 date-time format in UTC for all timestamps. Fields must note ISO 8601 in their description.';

export default (input, options, { path, documentInventory }) => {
  const oas = documentInventory.unresolved;
  const propertyObject = resolveObject(oas, path);
  const fieldType = path[path.length - 2];
  // Not to duplicate the check for referenced schemas
  if (!propertyObject) {
    return;
  }

  if (hasException(input, RULE_NAME)) {
    collectException(input, RULE_NAME, path);
    return;
  }

  let format;
  let description = input.description;
  if (fieldType === 'parameters') {
    format = input.schema?.format;
  } else if (fieldType === 'properties') {
    format = input.format;
  }

  if (format === 'date-time') {
    if (!description?.includes('ISO 8601') && !description?.includes('UTC')) {
      return collectAndReturnViolation(path, RULE_NAME, [
        {
          path,
          message: ERROR_MESSAGE,
        },
      ]);
    }

    collectAdoption(path, RULE_NAME);
  }
};
