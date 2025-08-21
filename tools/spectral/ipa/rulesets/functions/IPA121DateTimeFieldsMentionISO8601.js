import { evaluateAndCollectAdoptionStatus } from './utils/collectionUtils.js';

const ERROR_MESSAGE =
  'API producers must use ISO 8601 date-time format in UTC for all timestamps. Fields must note ISO 8601 and UTC in their description.';

export default (input, options, { path, rule }) => {
  const ruleName = rule.name;
  const fieldType = path[path.length - 2];
  const description = input.description;

  let format;
  if (fieldType === 'parameters') {
    format = input.schema?.format;
  } else if (fieldType === 'properties') {
    format = input.format;
  }

  let errors = [];
  if (format === 'date-time') {
    if (!description?.includes('ISO 8601') && !description?.includes('UTC')) {
      errors = [
        {
          path,
          message: ERROR_MESSAGE,
        },
      ];
    }

    return evaluateAndCollectAdoptionStatus(errors, ruleName, input, path);
  }
};
