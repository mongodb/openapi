import { evaluateAndCollectAdoptionStatus, handleInternalError } from './utils/collectionUtils.js';
import { pathIsForRequestVersion, pathIsForResponseVersion } from './utils/componentUtils.js';
import { schemaIsObject } from './utils/schemaUtils.js';

const RULE_NAME = 'xgen-IPA-117-objects-must-be-well-defined';
const ERROR_MESSAGE =
  'Components of type "object" must be well-defined with for example a schema, example(s) or properties.';

/**
 * The rule checks components of `type: 'object'` for the presence of one of the properties:
 * `schema`, `examples`, `example`, `oneOf`, `anyOf`, `allOf`, `properties` or `additionalProperties`.
 *
 * @param input the component to evaluate
 * @param {string[]} ignoredPaths paths to ignore, for example: 'components.schemas.MySchema'
 * @param path the path to the component being evaluated
 */
export default (input, { ignoredPaths }, { path }) => {
  // Ignore paths that match the passed ignoredPaths
  const joinedPath = path.join('.');
  if (ignoredPaths.some((ignoredPath) => ignoredPath === joinedPath)) {
    return;
  }

  // Ignore types other than object
  if (!schemaIsObject(input)) {
    return;
  }

  // Ignore non-JSON requests
  if (pathIsForRequestVersion(path) && !path[5].endsWith('json')) {
    return;
  }

  // Ignore non-JSON responses
  if (pathIsForResponseVersion(path) && !path[6].endsWith('json')) {
    return;
  }

  // Ignore references
  if (input['$ref']) {
    return;
  }

  const errors = checkViolationsAndReturnErrors(input, path);
  return evaluateAndCollectAdoptionStatus(errors, RULE_NAME, input, path);
};

function checkViolationsAndReturnErrors(object, path) {
  try {
    const validProperties = [
      'schema',
      'example',
      'examples',
      'allOf',
      'anyOf',
      'oneOf',
      'properties',
      'additionalProperties',
    ];
    if (Object.keys(object).some((key) => validProperties.includes(key))) {
      return [];
    }
    return [{ path, message: ERROR_MESSAGE }];
  } catch (e) {
    return handleInternalError(RULE_NAME, path, e);
  }
}
