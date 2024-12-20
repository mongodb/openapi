import { hasException } from './utils/exceptions.js';
import { casing } from '@stoplight/spectral-functions';

const RULE_NAME = 'xgen-IPA-123-enum-values-must-be-upper-snake-case';
const ERROR_MESSAGE = 'enum value must be UPPER_SNAKE_CASE.';

function getSchemaPath(path) {
  if (path.includes('components')) {
    return path.slice(0, 3);
  } else if (path.includes('paths')) {
    const index = path.findIndex((item) => item === 'schema');
    return path.slice(0, index + 1);
  }
}

export default (input, _, {path}) => {
  //There are two path types for enum definition
  //First type: components.schemas.schemaName.*.enum
  //Second type: paths.*.method.parameters[*].schema.enum
  if(hasException(getSchemaPath(path), RULE_NAME)) {
    return;
  }

  const errors = [];
  for (const enumValue of input) {
    const isUpperSnakeCase = casing(enumValue, { type: 'macro' });

    if (isUpperSnakeCase) {
      errors.push({
        message: `${enumValue} ${ERROR_MESSAGE} `,
        path: path.concat(enumValue),
      });
    }
  }

  return errors;
};
