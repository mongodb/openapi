import { hasException } from './utils/exceptions.js';
import { collectAdoption, collectAndReturnViolation, collectException } from './utils/collectionUtils.js';

const RULE_NAME = 'xgen-IPA-121-date-time-fields-mention-iso-8601';
const ERROR_MESSAGE =
  'API producers must use ISO 8601 date-time format in UTC for all timestamps. Fields must note ISO 8601 and UTC in their description.';

export default (input, options, { path }) => {
  const fieldType = path[path.length - 2];

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
